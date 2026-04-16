import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type PrismaTransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    if (process.env['NODE_ENV'] === 'development') {
      this.$on('query' as never, (event: { query: string; params: unknown }) => {
        process.stderr.write(`[Prisma Query] ${event.query}\n`);
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
