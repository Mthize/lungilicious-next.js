import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { DatabaseHealthIndicator } from './database.health.js';

@Global()
@Module({
  providers: [PrismaService, DatabaseHealthIndicator],
  exports: [PrismaService, DatabaseHealthIndicator],
})
export class DatabaseModule {}
