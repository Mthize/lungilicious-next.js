import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { Public } from '../../common/decorators/public.decorator.js';
import { CartService } from './cart.service.js';
import { parseAddCartItemDto, type AddCartItemDto } from './dto/add-cart-item.dto.js';
import {
  parseApplyCouponDto,
  type ApplyCouponDto,
} from './dto/apply-coupon.dto.js';
import {
  parseUpdateCartItemDto,
  type UpdateCartItemDto,
} from './dto/update-cart-item.dto.js';

type SessionStore = {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
};

@Public()
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  getCart(@Req() request: FastifyRequest) {
    const { sessionId, userId } = this.getSessionContext(request);

    return this.cart.getCart(sessionId, userId ?? undefined);
  }

  @Post('items')
  addItem(
    @Req() request: FastifyRequest,
    @Body(ValidationPipe) body: AddCartItemDto,
  ) {
    const { sessionId, userId } = this.getSessionContext(request);

    return this.cart.addItem(sessionId, userId, parseAddCartItemDto(body));
  }

  @Patch('items/:id')
  updateItem(
    @Req() request: FastifyRequest,
    @Param('id') cartItemId: string,
    @Body(ValidationPipe) body: UpdateCartItemDto,
  ) {
    const { sessionId, userId } = this.getSessionContext(request);

    return this.cart.updateItem(sessionId, userId, cartItemId, parseUpdateCartItemDto(body));
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Req() request: FastifyRequest, @Param('id') cartItemId: string) {
    const { sessionId, userId } = this.getSessionContext(request);

    await this.cart.removeItem(sessionId, userId, cartItemId);
  }

  @Post('apply-coupon')
  applyCoupon(
    @Req() request: FastifyRequest,
    @Body(ValidationPipe) body: ApplyCouponDto,
  ) {
    const { sessionId, userId } = this.getSessionContext(request);

    return this.cart.applyCoupon(sessionId, userId, parseApplyCouponDto(body));
  }

  private getSessionContext(request: FastifyRequest): {
    sessionId: string;
    userId: string | null;
  } {
    const session = request.session as SessionStore;
    const currentSessionId = session.get('sessionId');
    const sessionId = typeof currentSessionId === 'string' && currentSessionId.length > 0
      ? currentSessionId
      : randomUUID();

    if (sessionId !== currentSessionId) {
      session.set('sessionId', sessionId);
    }

    const currentUserId = session.get('userId');

    return {
      sessionId,
      userId: typeof currentUserId === 'string' && currentUserId.length > 0
        ? currentUserId
        : null,
    };
  }
}
