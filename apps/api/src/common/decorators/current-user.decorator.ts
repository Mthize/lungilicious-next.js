import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    const user = ((request as unknown) as Record<string, unknown>)['user'] ?? null;

    if (typeof data === 'string' && user && typeof user === 'object') {
      return (user as Record<string, unknown>)[data] ?? null;
    }

    return user;
  },
);
