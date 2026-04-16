import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import secureSession from '@fastify/secure-session';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthController } from '../../src/modules/auth/auth.controller.js';
import { MeController } from '../../src/modules/auth/me.controller.js';
import { ProductController } from '../../src/modules/catalog/product.controller.js';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import { CustomerService } from '../../src/modules/customer/customer.service.js';
import { ProductService } from '../../src/modules/catalog/product.service.js';

type CookieResponse = {
  cookies: string[];
};

describe('Full Auth Flow Integration', () => {
  let app: NestFastifyApplication;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const authServiceMock = {
      register: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'integration@example.com',
        customer: {
          id: 'customer-1',
          firstName: 'Lungi',
          lastName: 'Licious',
        },
      }),
      login: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'integration@example.com',
        customer: {
          id: 'customer-1',
          firstName: 'Lungi',
          lastName: 'Licious',
        },
      }),
      logout: vi.fn().mockResolvedValue(undefined),
    };

    const customerServiceMock = {
      getProfile: vi.fn().mockResolvedValue({
        id: 'customer-1',
        userId: 'user-1',
        firstName: 'Lungi',
        lastName: 'Licious',
        phone: null,
        avatarUrl: null,
        marketingConsent: false,
        communicationConsent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        preference: null,
        user: {
          id: 'user-1',
          email: 'integration@example.com',
        },
      }),
      updateProfile: vi.fn().mockImplementation(async (_userId: string, dto: Record<string, unknown>) => ({
        id: 'customer-1',
        userId: 'user-1',
        firstName: (dto.firstName as string | undefined) ?? 'Lungi',
        lastName: (dto.lastName as string | undefined) ?? 'Licious',
        phone: (dto.phone as string | null | undefined) ?? null,
        avatarUrl: (dto.avatarUrl as string | null | undefined) ?? null,
        marketingConsent: false,
        communicationConsent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        preference: null,
        user: {
          id: 'user-1',
          email: 'integration@example.com',
        },
      })),
    };

    const productServiceMock = {
      findAll: vi.fn().mockResolvedValue({
        data: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      }),
      findBySlug: vi.fn(),
    };

    moduleRef = await Test.createTestingModule({
      controllers: [AuthController, MeController, ProductController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: CustomerService, useValue: customerServiceMock },
        { provide: ProductService, useValue: productServiceMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.register(secureSession as never, {
      key: Buffer.alloc(32, 1),
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

  it('should compile fallback auth-flow test module and register journey routes', async () => {
    expect(app.get(AuthController)).toBeDefined();
    expect(app.get(MeController)).toBeDefined();
    expect(app.get(ProductController)).toBeDefined();

    const fastify = app.getHttpAdapter().getInstance() as {
      hasRoute: (opts: { method: string; url: string }) => boolean;
    };

    expect(fastify.hasRoute({ method: 'POST', url: '/auth/register' })).toBe(true);
    expect(fastify.hasRoute({ method: 'POST', url: '/auth/login' })).toBe(true);
    expect(fastify.hasRoute({ method: 'GET', url: '/products' })).toBe(true);
    expect(fastify.hasRoute({ method: 'GET', url: '/me' })).toBe(true);
    expect(fastify.hasRoute({ method: 'PATCH', url: '/me' })).toBe(true);
    expect(fastify.hasRoute({ method: 'POST', url: '/auth/logout' })).toBe(true);
  });

  it.skip('should complete the full customer journey', async () => {
    // Requires a real database, Redis, BullMQ, config env, and session guard wiring.
    const { AppModule } = await import('../../src/app.module.js');
    const integrationModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const integrationApp = integrationModule.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await integrationApp.register(secureSession as never, {
      key: Buffer.alloc(32, 2),
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
        headers: Record<string, string | string[] | undefined>;
      }>;
    };

    const registerResponse = await server.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'journey@example.com',
        password: 'supersecret123',
        firstName: 'Journey',
        lastName: 'Tester',
      },
    });
    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.json().data).not.toHaveProperty('passwordHash');

    const loginResponse = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'journey@example.com',
        password: 'supersecret123',
      },
    });
    expect(loginResponse.statusCode).toBe(200);
    const cookieHeader = extractCookies(loginResponse);

    const browseResponse = await server.inject({
      method: 'GET',
      url: '/products',
      headers: cookieHeader,
    });
    expect(browseResponse.statusCode).toBe(200);

    const meResponse = await server.inject({
      method: 'GET',
      url: '/me',
      headers: cookieHeader,
    });
    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json().data.firstName).toBe('Journey');

    const patchResponse = await server.inject({
      method: 'PATCH',
      url: '/me',
      headers: cookieHeader,
      payload: {
        phone: '+27110000000',
      },
    });
    expect(patchResponse.statusCode).toBe(200);
    expect(patchResponse.json().data.phone).toBe('+27110000000');

    const logoutResponse = await server.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: cookieHeader,
    });
    expect(logoutResponse.statusCode).toBe(204);

    const revokedSessionResponse = await server.inject({
      method: 'GET',
      url: '/me',
      headers: cookieHeader,
    });
    expect(revokedSessionResponse.statusCode).toBe(401);

    await integrationApp.close();
  });
});

function extractCookies(response: CookieResponse): Record<string, string> {
  const cookie = response.cookies.join('; ');
  return cookie.length > 0 ? { cookie } : {};
}
