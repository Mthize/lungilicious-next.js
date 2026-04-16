import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { Observable, tap } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { AuditService } from '../../modules/audit/audit.service.js';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const method = request.method;

    if (method === 'GET') {
      return next.handle();
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return next.handle();
    }

    const action = method.toLowerCase();
    const resource = context.getClass().name.replace('Controller', '').toLowerCase();
    const requestRecord = request as unknown as Record<string, unknown>;
    const requestUser = requestRecord['user'] as Record<string, unknown> | undefined;
    const session = request.session as { get?: (key: string) => unknown } | undefined;
    const userId = typeof requestUser?.['id'] === 'string'
      ? requestUser.id as string
      : session?.get?.('userId');

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const resourceId = this.getResourceId(data);

          this.auditService.log({
            action,
            resource,
            resourceId,
            userId: typeof userId === 'string' ? userId : undefined,
            request,
          }).catch(() => {
            // Never block request execution on audit failures.
          });
        },
      }),
    );
  }

  private getResourceId(data: unknown): string {
    if (!data || typeof data !== 'object') {
      return '';
    }

    const record = data as Record<string, unknown>;
    if (typeof record['id'] === 'string') {
      return record['id'];
    }

    const nestedData = record['data'];
    if (nestedData && typeof nestedData === 'object') {
      const nestedRecord = nestedData as Record<string, unknown>;
      if (typeof nestedRecord['id'] === 'string') {
        return nestedRecord['id'];
      }
    }

    return '';
  }
}
