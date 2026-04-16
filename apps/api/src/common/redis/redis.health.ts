import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { RedisService } from './redis.service.js';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redis: RedisService) {
    super();
  }

  async check(name: string): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redis.client.ping();
      if (pong !== 'PONG') {
        throw new Error('Redis ping failed');
      }
      return this.getStatus(name, true);
    } catch {
      throw new HealthCheckError(`${name} is not available`, this.getStatus(name, false));
    }
  }
}
