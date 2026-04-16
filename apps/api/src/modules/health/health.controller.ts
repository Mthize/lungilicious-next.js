import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from '../../common/database/database.health.js';
import { RedisHealthIndicator } from '../../common/redis/redis.health.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DatabaseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.check('db'),
      () => this.redis.check('redis'),
    ]);
  }

  @Get('db')
  @HealthCheck()
  checkDb(): Promise<HealthCheckResult> {
    return this.health.check([() => this.db.check('db')]);
  }

  @Get('redis')
  @HealthCheck()
  checkRedis(): Promise<HealthCheckResult> {
    return this.health.check([() => this.redis.check('redis')]);
  }
}
