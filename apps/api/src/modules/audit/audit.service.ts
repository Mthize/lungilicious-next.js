import { Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../../common/database/prisma.service.js';

type AuditLogParams = {
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  before?: unknown;
  after?: unknown;
  request?: FastifyRequest;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log({
    action,
    resource,
    resourceId,
    userId,
    before,
    after,
    request,
  }: AuditLogParams): Promise<void> {
    const requestUserId = this.getRequestUserId(request);
    const userAgentHeader = request?.headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader)
      ? userAgentHeader.join(', ')
      : (userAgentHeader ?? null);

    await this.prisma.auditLog.create({
      data: {
        action,
        resource,
        resourceId: resourceId ?? '',
        userId: userId ?? requestUserId,
        before,
        after,
        ipAddress: request?.ip ?? null,
        userAgent,
      },
    });
  }

  async logLogin(userId: string, request: FastifyRequest): Promise<void> {
    await this.log({
      action: 'login',
      resource: 'auth',
      userId,
      request,
    });
  }

  async logSensitiveAction(
    action: string,
    resource: string,
    resourceId: string,
    userId: string,
    request: FastifyRequest,
  ): Promise<void> {
    await this.log({
      action,
      resource,
      resourceId,
      userId,
      request,
    });
  }

  private getRequestUserId(request?: FastifyRequest): string | undefined {
    const user = ((request as unknown as Record<string, unknown> | undefined)?.['user']) as
      | Record<string, unknown>
      | undefined;
    const userId = user?.['id'];

    return typeof userId === 'string' && userId.length > 0 ? userId : undefined;
  }
}
