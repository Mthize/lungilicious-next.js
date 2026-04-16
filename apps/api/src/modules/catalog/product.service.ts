import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductPriceChangedEvent } from '../../common/events/index.js';
import { PrismaService } from '../../common/database/prisma.service.js';
import type { CreateProductDto } from './dto/create-product.dto.js';
import type { PaginatedResult } from './dto/pagination.dto.js';
import type { ProductQueryDto } from './dto/product-query.dto.js';
import type { UpdateProductDto } from './dto/update-product.dto.js';

const publicProductSelect = {
  id: true,
  slug: true,
  name: true,
  headline: true,
  subheadline: true,
  shortDescription: true,
  longDescription: true,
  storyIntro: true,
  ingredientNarrative: true,
  usageSuggestions: true,
  flavorNotes: true,
  wellnessPositioning: true,
  isFeatured: true,
  layoutVariant: true,
  themeAccent: true,
  emphasisStyle: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
      imageUrl: true,
      sortOrder: true,
      seoTitle: true,
      seoDescription: true,
    },
  },
  variants: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      compareAtPrice: true,
      isDefault: true,
      sortOrder: true,
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
          createdAt: true,
        },
      },
    },
  },
  images: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      url: true,
      altText: true,
      caption: true,
      isPrimary: true,
      sortOrder: true,
    },
  },
  badges: {
    select: {
      id: true,
      badgeType: true,
    },
  },
  seo: {
    select: {
      id: true,
      title: true,
      description: true,
      canonicalUrl: true,
      openGraphImage: true,
    },
  },
} as const;

const adminProductSelect = {
  id: true,
  slug: true,
  name: true,
  headline: true,
  subheadline: true,
  shortDescription: true,
  longDescription: true,
  storyIntro: true,
  ingredientNarrative: true,
  usageSuggestions: true,
  flavorNotes: true,
  wellnessPositioning: true,
  status: true,
  isFeatured: true,
  categoryId: true,
  layoutVariant: true,
  themeAccent: true,
  emphasisStyle: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
      imageUrl: true,
      isActive: true,
      sortOrder: true,
      seoTitle: true,
      seoDescription: true,
    },
  },
  variants: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      compareAtPrice: true,
      isDefault: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      prices: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          validFrom: true,
          validUntil: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  },
  images: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      url: true,
      altText: true,
      caption: true,
      isPrimary: true,
      sortOrder: true,
      createdAt: true,
    },
  },
  badges: {
    select: {
      id: true,
      badgeType: true,
    },
  },
  seo: {
    select: {
      id: true,
      title: true,
      description: true,
      canonicalUrl: true,
      openGraphImage: true,
    },
  },
  attributes: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      key: true,
      value: true,
      sortOrder: true,
    },
  },
} as const;

type PublicProductRow = {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  subheadline: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  status: string;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    price: unknown;
    compareAtPrice: unknown;
    isDefault: boolean;
    sortOrder: number;
    prices: Array<{ id: string; amount: unknown; currency: string; isActive: boolean }>;
  }>;
  images: Array<{ id: string; url: string; alt: string | null; sortOrder: number }>;
  badges: Array<{ id: string; label: string; color: string | null; sortOrder: number }>;
  seo: { id: string; metaTitle: string | null; metaDescription: string | null; openGraphImage: string | null } | null;
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(query: ProductQueryDto): Promise<PaginatedResult<PublicProductRow>> {
    const { page, pageSize, categoryId, search } = query;
    const where = {
      status: 'ACTIVE',
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { name: { contains: search } } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
        select: publicProductSelect,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  findBySlug(slug: string): Promise<PublicProductRow | null> {
    return this.prisma.product.findFirst({
      where: {
        slug,
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: publicProductSelect,
    });
  }

  async adminCreate(dto: CreateProductDto): Promise<Record<string, unknown>> {
    const primaryCategoryId = dto.categoryIds[0];

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        shortDescription: dto.description,
        longDescription: dto.description,
        status: dto.status,
        categoryId: primaryCategoryId,
        variants: {
          create: dto.variants.map((variant) => ({
            sku: variant.sku,
            name: variant.name,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            isDefault: variant.isDefault,
            sortOrder: variant.sortOrder,
            prices: {
              create: variant.prices.map((price) => ({
                amount: price.amount,
                currency: price.currency,
                validFrom: price.validFrom,
                validUntil: price.validUntil,
                isActive: price.isActive,
              })),
            },
          })),
        },
        images: {
          create: dto.images.map((image) => ({
            url: image.url,
            altText: image.altText,
            caption: image.caption,
            isPrimary: image.isPrimary,
            sortOrder: image.sortOrder,
          })),
        },
        ...(dto.seo
          ? {
              seo: {
                create: {
                  title: dto.seo.title,
                  description: dto.seo.description,
                  canonicalUrl: dto.seo.canonicalUrl,
                  openGraphImage: dto.seo.openGraphImage,
                },
              },
            }
          : {}),
      },
      select: adminProductSelect,
    });
  }

  async adminFindAll(query: ProductQueryDto): Promise<PaginatedResult<any>> {
    const { page, pageSize, categoryId, search } = query;
    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { name: { contains: search } } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        select: adminProductSelect,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  adminFindById(id: string): Promise<any | null> {
    return this.prisma.product.findUnique({
      where: { id },
      select: adminProductSelect,
    });
  }

  async adminUpdate(id: string, dto: UpdateProductDto): Promise<Record<string, unknown>> {
    const existingProduct = dto.variants !== undefined
      ? await this.prisma.product.findUnique({
          where: { id },
          select: {
            id: true,
            variants: {
              select: {
                id: true,
                sku: true,
                price: true,
              },
            },
          },
        })
      : null;
    const data: Record<string, unknown> = {};

    if (dto.name !== undefined) data['name'] = dto.name;
    if (dto.slug !== undefined) data['slug'] = dto.slug;
    if (dto.description !== undefined) {
      data['shortDescription'] = dto.description;
      data['longDescription'] = dto.description;
    }
    if (dto.status !== undefined) data['status'] = dto.status;
    if (dto.categoryIds && dto.categoryIds.length > 0) data['categoryId'] = dto.categoryIds[0];

    if (dto.variants !== undefined) {
      data['variants'] = {
        deleteMany: {},
        create: dto.variants.map((variant) => ({
          sku: variant.sku,
          name: variant.name,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          isDefault: variant.isDefault,
          sortOrder: variant.sortOrder,
          prices: {
            create: variant.prices.map((price) => ({
              amount: price.amount,
              currency: price.currency,
              validFrom: price.validFrom,
              validUntil: price.validUntil,
              isActive: price.isActive,
            })),
          },
        })),
      };
    }

    if (dto.images !== undefined) {
      data['images'] = {
        deleteMany: {},
        create: dto.images.map((image) => ({
          url: image.url,
          altText: image.altText,
          caption: image.caption,
          isPrimary: image.isPrimary,
          sortOrder: image.sortOrder,
        })),
      };
    }

    if (dto.seo !== undefined) {
      data['seo'] = dto.seo
        ? {
            upsert: {
              create: {
                title: dto.seo.title,
                description: dto.seo.description,
                canonicalUrl: dto.seo.canonicalUrl,
                openGraphImage: dto.seo.openGraphImage,
              },
              update: {
                title: dto.seo.title,
                description: dto.seo.description,
                canonicalUrl: dto.seo.canonicalUrl,
                openGraphImage: dto.seo.openGraphImage,
              },
            },
          }
        : { delete: true };
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data,
      select: adminProductSelect,
    });

    if (dto.variants !== undefined && existingProduct) {
      for (const variant of dto.variants) {
        const previousVariant = existingProduct.variants.find(
          (existing: { sku: string; price: unknown; id: string }) => existing.sku === variant.sku,
        );

        if (previousVariant && Number(previousVariant.price) !== variant.price) {
          this.eventEmitter.emit(
            'catalog.product-price-changed',
            new ProductPriceChangedEvent(
              existingProduct.id,
              previousVariant.id,
              Number(previousVariant.price),
              variant.price,
            ),
          );
        }
      }
    }

    return updatedProduct;
  }

  adminSoftDelete(id: string): Promise<Record<string, unknown>> {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: adminProductSelect,
    });
  }
}
