import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  requestId: string | null;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const requestId = ((request.headers as Record<string, string | string[] | undefined>)['x-request-id']) as string | undefined;

    const url = request.url ?? '';
    if (url.startsWith('/health')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        requestId: requestId ?? null,
      })),
    );
  }
}
