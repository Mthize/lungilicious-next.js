import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { RedisModule } from '../../common/redis/redis.module.js';
import { AuditService } from './audit.service.js';
import { FeatureFlagService } from './feature-flag.service.js';

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [AuditService, FeatureFlagService],
  exports: [AuditService, FeatureFlagService],
})
export class AuditModule {}
