import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService, type PrismaTransactionClient } from '../../common/database/prisma.service.js';
import type { AddCartItemDto } from './dto/add-cart-item.dto.js';
import type { ApplyCouponDto } from './dto/apply-coupon.dto.js';
import type { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

type CartItemRecord = {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  priceAtAdd: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type CartRecord = {
  id: string;
  customerId: string | null;
  sessionId: string | null;
  status: string;
  subtotal: unknown;
  discountAmount: unknown;
  total: unknown;
  appliedCouponCodeId: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemRecord[];
};

type HydratedVariant = {
  id: string;
  sku: string;
  name: string;
  price: unknown;
  compareAtPrice: unknown;
  isDefault: boolean;
  sortOrder: number;
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    deletedAt: Date | null;
  };
  prices: Array<{
    id: string;
    amount: unknown;
    currency: string;
    validFrom: Date | null;
    validUntil: Date | null;
    isActive: boolean;
  }>;
};

type HydratedCartItem = CartItemRecord & {
  variant: HydratedVariant | null;
};

type AppliedCouponRecord = {
  id: string;
  code: string;
  maxUsageCount: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  promotion: {
    id: string;
    name: string;
    type: string;
    discountValue: unknown;
    minOrderAmount: unknown;
    validFrom: Date | null;
    validUntil: Date | null;
    isActive: boolean;
  };
};

export type HydratedCart = Omit<CartRecord, 'subtotal' | 'discountAmount' | 'total' | 'items'> & {
  items: HydratedCartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedCoupon: AppliedCouponRecord | null;
};

const cartSelect = {
  id: true,
  customerId: true,
  sessionId: true,
  status: true,
  subtotal: true,
  discountAmount: true,
  total: true,
  appliedCouponCodeId: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      cartId: true,
      productVariantId: true,
      quantity: true,
      priceAtAdd: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  appliedCouponCode: {
    select: {
      id: true,
      code: true,
      maxUsageCount: true,
      usedCount: true,
      isActive: true,
      expiresAt: true,
      promotion: {
        select: {
          id: true,
          name: true,
          type: true,
          discountValue: true,
          minOrderAmount: true,
          validFrom: true,
          validUntil: true,
          isActive: true,
        },
      },
    },
  },
} as const;

const variantSelect = {
  id: true,
  sku: true,
  name: true,
  price: true,
  compareAtPrice: true,
  isDefault: true,
  sortOrder: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      deletedAt: true,
    },
  },
  prices: {
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      amount: true,
      currency: true,
      validFrom: true,
      validUntil: true,
      isActive: true,
    },
  },
} as const;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(sessionId?: string, userId?: string): Promise<HydratedCart> {
    const cart = await this.getOrCreateCart(sessionId, userId);
    await this.recalculateTotals(cart);

    return this.hydrateCart(await this.fetchCart(cart.id));
  }

  async addItem(
    sessionId: string,
    userId: string | null,
    dto: AddCartItemDto,
  ): Promise<HydratedCartItem> {
    const cart = await this.getOrCreateCart(sessionId, userId ?? undefined);
    const variant = await this.getActiveVariant(dto.variantId);
    const currentPrice = await this.getCurrentPrice(dto.variantId);
    const existingItem = cart.items.find((item) => item.productVariantId === dto.variantId);

    const item = existingItem
      ? await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + dto.quantity,
            priceAtAdd: currentPrice,
          },
          select: cartSelect.items.select,
        })
      : await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productVariantId: dto.variantId,
            quantity: dto.quantity,
            priceAtAdd: currentPrice,
          },
          select: cartSelect.items.select,
        });

    await this.recalculateTotals(await this.fetchCart(cart.id));

    return {
      ...(item as CartItemRecord),
      variant,
    };
  }

  async updateItem(
    sessionId: string,
    userId: string | null,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<HydratedCartItem | null> {
    if (dto.quantity === 0) {
      await this.removeItem(sessionId, userId, cartItemId);
      return null;
    }

    const cart = await this.getOrCreateCart(sessionId, userId ?? undefined);
    const item = await this.getOwnedCartItem(cart.id, cartItemId);
    const variant = await this.getActiveVariant(item.productVariantId);
    const currentPrice = await this.getCurrentPrice(item.productVariantId);
    const updatedItem = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: dto.quantity,
        priceAtAdd: currentPrice,
      },
      select: cartSelect.items.select,
    });

    await this.recalculateTotals(await this.fetchCart(cart.id));

    return {
      ...(updatedItem as CartItemRecord),
      variant,
    };
  }

  async removeItem(
    sessionId: string,
    userId: string | null,
    cartItemId: string,
  ): Promise<void> {
    const cart = await this.getOrCreateCart(sessionId, userId ?? undefined);
    await this.getOwnedCartItem(cart.id, cartItemId);

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    await this.recalculateTotals(await this.fetchCart(cart.id));
  }

  async applyCoupon(
    sessionId: string,
    userId: string | null,
    { code }: ApplyCouponDto,
  ): Promise<HydratedCart> {
    const cart = await this.getOrCreateCart(sessionId, userId ?? undefined);

    if (cart.appliedCouponCodeId) {
      throw new BadRequestException('Coupon already applied');
    }

    const couponCode = await this.prisma.couponCode.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive',
        },
      },
      select: cartSelect.appliedCouponCode.select,
    });

    if (!couponCode || !couponCode.isActive || !couponCode.promotion.isActive) {
      throw new BadRequestException('Invalid coupon');
    }

    const now = new Date();
    if (couponCode.expiresAt && couponCode.expiresAt.getTime() <= now.getTime()) {
      throw new BadRequestException('Coupon expired');
    }

    if (couponCode.promotion.validUntil && couponCode.promotion.validUntil.getTime() <= now.getTime()) {
      throw new BadRequestException('Coupon expired');
    }

    if (couponCode.maxUsageCount !== null && couponCode.usedCount >= couponCode.maxUsageCount) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    const subtotal = this.calculateSubtotal(cart.items);
    if (
      couponCode.promotion.minOrderAmount !== null
      && subtotal < Number(couponCode.promotion.minOrderAmount)
    ) {
      throw new BadRequestException('Minimum order not met');
    }

    const discountAmount = this.calculateDiscount(subtotal, couponCode);

    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          appliedCouponCodeId: couponCode.id,
          discountAmount,
        },
      });

      await tx.couponCode.update({
        where: { id: couponCode.id },
        data: {
          usedCount: { increment: 1 },
        },
      });
    });

    await this.recalculateTotals(await this.fetchCart(cart.id), discountAmount);

    return this.hydrateCart(await this.fetchCart(cart.id));
  }

  async mergeGuestCart(guestSessionId: string, customerId: string, sessionId: string): Promise<void> {
    await this.prisma.$transaction(async (tx: PrismaTransactionClient) => {
      const guestCart = await tx.cart.findFirst({
        where: {
          sessionId: guestSessionId,
          status: 'ACTIVE',
        },
        select: {
          id: true,
          items: {
            select: {
              id: true,
              productVariantId: true,
              quantity: true,
              priceAtAdd: true,
            },
          },
        },
      });

      if (!guestCart || guestCart.items.length === 0) {
        return;
      }

      let customerCart = await tx.cart.findFirst({
        where: {
          customerId,
          status: 'ACTIVE',
        },
        select: {
          id: true,
          appliedCouponCodeId: true,
          discountAmount: true,
          items: {
            select: {
              id: true,
              productVariantId: true,
              quantity: true,
              priceAtAdd: true,
            },
          },
        },
      });

      if (!customerCart) {
        customerCart = await tx.cart.create({
          data: {
            customerId,
            sessionId,
            status: 'ACTIVE',
            subtotal: 0,
            discountAmount: 0,
            total: 0,
          },
          select: {
            id: true,
            appliedCouponCodeId: true,
            discountAmount: true,
            items: {
              select: {
                id: true,
                productVariantId: true,
                quantity: true,
                priceAtAdd: true,
              },
            },
          },
        });
      }

      for (const guestItem of guestCart.items) {
        const existingItem = customerCart.items.find(
          (item: { productVariantId: string }) => item.productVariantId === guestItem.productVariantId,
        );

        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + guestItem.quantity,
            },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: customerCart.id,
              productVariantId: guestItem.productVariantId,
              quantity: guestItem.quantity,
              priceAtAdd: guestItem.priceAtAdd,
            },
          });
        }
      }

      const mergedItems = await tx.cartItem.findMany({
        where: { cartId: customerCart.id },
        select: {
          quantity: true,
          priceAtAdd: true,
        },
      });
      const subtotal = mergedItems.reduce(
        (sum: number, item: { quantity: number; priceAtAdd: unknown }) => sum + Number(item.priceAtAdd) * item.quantity,
        0,
      );
      const discountAmount = Math.min(subtotal, Number(customerCart.discountAmount ?? 0));

      await tx.cart.update({
        where: { id: customerCart.id },
        data: {
          sessionId,
          subtotal,
          discountAmount,
          total: Math.max(0, subtotal - discountAmount),
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: guestCart.id },
      });

      await tx.cart.update({
        where: { id: guestCart.id },
        data: { status: 'MERGED' },
      });
    });
  }

  async removeCoupon(cartId: string): Promise<HydratedCart> {
    const cart = await this.fetchCart(cartId);

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        appliedCouponCodeId: null,
        discountAmount: 0,
      },
    });

    await this.recalculateTotals(await this.fetchCart(cart.id), 0);

    return this.hydrateCart(await this.fetchCart(cart.id));
  }

  private async getOrCreateCart(sessionId?: string, userId?: string): Promise<CartRecord> {
    const customerId = userId ? await this.getCustomerId(userId) : null;
    const where = customerId
      ? { customerId, status: 'ACTIVE' }
      : sessionId
        ? { sessionId, status: 'ACTIVE' }
        : null;

    if (!where) {
      throw new BadRequestException('Cart session is required');
    }

    const existingCart = await this.prisma.cart.findFirst({
      where,
      select: cartSelect,
    });

    if (existingCart) {
      return existingCart as CartRecord;
    }

    const createdCart = await this.prisma.cart.create({
      data: {
        customerId: customerId ?? undefined,
        sessionId: customerId ? sessionId ?? undefined : sessionId,
        status: 'ACTIVE',
        subtotal: 0,
        discountAmount: 0,
        total: 0,
      },
      select: cartSelect,
    });

    return createdCart as CartRecord;
  }

  private async recalculateTotals(cart: CartRecord, explicitDiscountAmount?: number): Promise<void> {
    const subtotal = this.calculateSubtotal(cart.items);
    const couponCode = cart.appliedCouponCodeId ? await this.getAppliedCoupon(cart.appliedCouponCodeId) : null;
    const rawDiscount = explicitDiscountAmount ?? (couponCode ? this.calculateDiscount(subtotal, couponCode) : Number(cart.discountAmount));
    const discountAmount = Math.min(subtotal, Math.max(0, rawDiscount || 0));
    const total = Math.max(0, subtotal - discountAmount);

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotal,
        discountAmount,
        total,
      },
    });
  }

  private async fetchCart(cartId: string): Promise<CartRecord> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      select: cartSelect,
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart as CartRecord;
  }

  private async hydrateCart(cart: CartRecord): Promise<HydratedCart> {
    const variantIds = [...new Set(cart.items.map((item) => item.productVariantId))];
    const variants = variantIds.length > 0
      ? await this.prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: variantSelect,
        })
      : [];

    const variantMap = new Map<string, HydratedVariant>(
      variants.map((variant: HydratedVariant) => [variant.id, variant]),
    );

    return {
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        variant: variantMap.get(item.productVariantId) ?? null,
      })),
      subtotal: Number(cart.subtotal),
      discountAmount: Number(cart.discountAmount),
      total: Number(cart.total),
      appliedCoupon: (cart as unknown as { appliedCouponCode: AppliedCouponRecord | null }).appliedCouponCode ?? null,
    };
  }

  private async getActiveVariant(variantId: string): Promise<HydratedVariant> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: variantSelect,
    });

    if (!variant || variant.product.status !== 'ACTIVE' || variant.product.deletedAt) {
      throw new BadRequestException('Product variant is not available');
    }

    return variant as HydratedVariant;
  }

  private async getCurrentPrice(variantId: string): Promise<number> {
    const now = new Date();
    const price = await this.prisma.price.findFirst({
      where: {
        productVariantId: variantId,
        isActive: true,
        OR: [{ validFrom: null }, { validFrom: { lte: now } }],
        AND: [{ OR: [{ validUntil: null }, { validUntil: { gte: now } }] }],
      },
      orderBy: [{ validFrom: 'desc' }, { createdAt: 'desc' }],
      select: { amount: true },
    });

    if (!price) {
      throw new BadRequestException('No active price found for variant');
    }

    return Number(price.amount);
  }

  private async getCustomerId(userId: string): Promise<string> {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer.id;
  }

  private async getOwnedCartItem(cartId: string, cartItemId: string): Promise<CartItemRecord> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      select: cartSelect.items.select,
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.cartId !== cartId) {
      throw new ForbiddenException('Cart item does not belong to this cart');
    }

    return item as CartItemRecord;
  }

  private async getAppliedCoupon(couponCodeId: string): Promise<AppliedCouponRecord | null> {
    const couponCode = await this.prisma.couponCode.findUnique({
      where: { id: couponCodeId },
      select: cartSelect.appliedCouponCode.select,
    });

    return couponCode as AppliedCouponRecord | null;
  }

  private calculateSubtotal(items: CartItemRecord[]): number {
    return items.reduce((sum, item) => sum + Number(item.priceAtAdd) * item.quantity, 0);
  }

  private calculateDiscount(subtotal: number, couponCode: AppliedCouponRecord): number {
    const discountValue = Number(couponCode.promotion.discountValue);
    const rawDiscount = couponCode.promotion.type === 'PERCENTAGE'
      ? subtotal * (discountValue / 100)
      : discountValue;

    return Math.min(subtotal, Math.max(0, rawDiscount));
  }
}
