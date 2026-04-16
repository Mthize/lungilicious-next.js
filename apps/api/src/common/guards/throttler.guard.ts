import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    throw new ThrottlerException('Too many requests');
  }

  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    return (
      ((req['headers'] as Record<string, string | string[] | undefined>)[
        'x-forwarded-for'
      ] as string)
      ?? ((req['ip'] as string) ?? 'unknown')
    );
  }
}
