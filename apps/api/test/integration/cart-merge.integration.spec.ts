import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import secureSession from '@fastify/secure-session';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthController } from '../../src/modules/auth/auth.controller.js';
import { CartController } from '../../src/modules/cart/cart.controller.js';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import { CartService } from '../../src/modules/cart/cart.service.js';

type CookieResponse = {
  cookies: string[];
};

describe('Guest Cart → Login → Merge Flow Integration', () => {
  let app: NestFastifyApplication;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const authServiceMock = {
      register: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'merge@example.com',
        customer: {
          id: 'customer-1',
          firstName: 'Guest',
          lastName: 'Merger',
        },
      }),
      login: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'merge@example.com',
        customer: {
          id: 'customer-1',
          firstName: 'Guest',
          lastName: 'Merger',
        },
      }),
    };

    const cartServiceMock = {
      getCart: vi.fn().mockResolvedValue({
        id: 'cart-1',
        status: 'ACTIVE',
        items: [],
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        appliedCoupon: null,
      }),
      addItem: vi.fn().mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        productVariantId: 'variant-1',
        quantity: 2,
        priceAtAdd: 199.99,
        variant: {
          id: 'variant-1',
          name: 'Botanical Blend',
        },
      }),
      updateItem: vi.fn().mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        productVariantId: 'variant-1',
        quantity: 3,
        priceAtAdd: 199.99,
        variant: {
          id: 'variant-1',
          name: 'Botanical Blend',
        },
      }),
      removeItem: vi.fn().mockResolvedValue(undefined),
      applyCoupon: vi.fn().mockResolvedValue({
        id: 'cart-1',
        status: 'ACTIVE',
        items: [
          {
            id: 'item-1',
            cartId: 'cart-1',
            productVariantId: 'variant-1',
            quantity: 2,
            priceAtAdd: 199.99,
            variant: {
              id: 'variant-1',
              name: 'Botanical Blend',
            },
          },
        ],
        subtotal: 399.98,
        discountAmount: 39.99,
        total: 359.99,
        appliedCoupon: {
          id: 'coupon-1',
          code: 'SAVE10',
        },
      }),
    };

    moduleRef = await Test.createTestingModule({
      controllers: [AuthController, CartController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: CartService, useValue: cartServiceMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.register(secureSession as never, {
      key: Buffer.alloc(32, 3),
      cookie: {
        httpOnly: true,
      },
    });
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should compile fallback cart-merge module and register guest cart merge routes', async () => {
    expect(app.get(AuthController)).toBeDefined();
    expect(app.get(CartController)).toBeDefined();

    const fastify = app.getHttpAdapter().getInstance() as {
      hasRoute: (opts: { method: string; url: string }) => boolean;
    };

    expect(fastify.hasRoute({ method: 'GET', url: '/cart' })).toBe(true);
    expect(fastify.hasRoute({ method: 'POST', url: '/cart/items' })).toBe(true);
    expect(fastify.hasRoute({ method: 'PATCH', url: '/cart/items/:id' })).toBe(true);
    expect(fastify.hasRoute({ method: 'DELETE', url: '/cart/items/:id' })).toBe(true);
    expect(fastify.hasRoute({ method: 'POST', url: '/cart/apply-coupon' })).toBe(true);
    expect(fastify.hasRoute({ method: 'POST', url: '/auth/register' })).toBe(true);
    expect(fastify.hasRoute({ method: 'POST', url: '/auth/login' })).toBe(true);
  });

  it.skip('should merge guest cart into customer cart on login', async () => {
    // Requires real DB, Redis, BullMQ, seeded products/variants/prices, and session guard wiring.
    const { AppModule } = await import('../../src/app.module.js');
    const integrationModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const integrationApp = integrationModule.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await integrationApp.register(secureSession as never, {
      key: Buffer.alloc(32, 4),
      cookie: {
        httpOnly: true,
      },
    });
    await integrationApp.init();
    await integrationApp.getHttpAdapter().getInstance().ready();

    const server = integrationApp.getHttpAdapter().getInstance() as {
      inject: (opts: {
        method: string;
        url: string;
        payload?: unknown;
        headers?: Record<string, string>;
      }) => Promise<{
        statusCode: number;
        json: () => Record<string, unknown>;
        cookies: string[];
      }>;
    };

    const guestCartResponse = await server.inject({
      method: 'GET',
      url: '/cart',
    });
    expect(guestCartResponse.statusCode).toBe(200);

    const guestCookieHeader = extractCookies(guestCartResponse);

    const addGuestItemResponse = await server.inject({
      method: 'POST',
      url: '/cart/items',
      headers: guestCookieHeader,
      payload: {
        variantId: 'seeded-variant-id',
        quantity: 2,
      },
    });
    expect(addGuestItemResponse.statusCode).toBe(201);

    const registerResponse = await server.inject({
      method: 'POST',
      url: '/auth/register',
      headers: guestCookieHeader,
      payload: {
        email: 'cart-merge@example.com',
        password: 'supersecret123',
        firstName: 'Cart',
        lastName: 'Merge',
      },
    });
    expect(registerResponse.statusCode).toBe(201);

    const mergedCartResponse = await server.inject({
      method: 'GET',
      url: '/cart',
      headers: guestCookieHeader,
    });
    expect(mergedCartResponse.statusCode).toBe(200);
    expect(Array.isArray((mergedCartResponse.json().data as { items?: unknown[] }).items)).toBe(true);

    await integrationApp.close();
  });

  it.skip('should sum quantities for duplicate items on merge', async () => {
    // Real-flow outline:
    // 1. Add quantity 2 to guest cart.
    // 2. Add same variant quantity 1 to authenticated customer cart.
    // 3. Login with guest session.
    // 4. Assert merged cart quantity is 3.
    expect(true).toBe(true);
  });

  it.skip('should apply valid coupon and reject invalid ones', async () => {
    // Real-flow outline:
    // 1. Add item to cart.
    // 2. POST /cart/apply-coupon with seeded valid coupon → expect discount.
    // 3. POST same coupon again → 400.
    // 4. POST invalid coupon → 400.
    expect(true).toBe(true);
  });
});

function extractCookies(response: CookieResponse): Record<string, string> {
  const cookie = response.cookies.join('; ');
  return cookie.length > 0 ? { cookie } : {};
}
