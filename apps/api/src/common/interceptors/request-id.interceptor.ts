import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';

export const REQUEST_ID_HEADER = 'X-Request-ID';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const requestId = (request.headers['x-request-id'] as string) ?? randomUUID();
    request.headers['x-request-id'] = requestId;

    const reply = context.switchToHttp().getResponse<FastifyReply>();
    reply.header(REQUEST_ID_HEADER, requestId);

    return next.handle();
  }
}
