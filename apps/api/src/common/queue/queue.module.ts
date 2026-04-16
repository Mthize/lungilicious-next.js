import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AppConfigService } from '../config/config.service.js';
import {
  QUEUE_EMAIL,
  QUEUE_NOTIFICATIONS,
  QUEUE_WEBHOOKS,
  QUEUE_INVENTORY,
  QUEUE_EXPORTS,
} from './queue.constants.js';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: AppConfigService) => ({
        connection: {
          url: config.redisUrl,
        },
      }),
      inject: [AppConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_EMAIL },
      { name: QUEUE_NOTIFICATIONS },
      { name: QUEUE_WEBHOOKS },
      { name: QUEUE_INVENTORY },
      { name: QUEUE_EXPORTS },
    ),
  ],
  providers: [
    {
      provide: 'QUEUE_SERVICE',
      useFactory: (): QueueServiceStub => new QueueServiceStub(),
    },
  ],
  exports: [BullModule, 'QUEUE_SERVICE'],
})
export class QueueModule {}

export class QueueServiceStub {
  addEmailJob(): Promise<void> {
    throw new Error('Not implemented');
  }
  addWebhookJob(): Promise<void> {
    throw new Error('Not implemented');
  }
  addInventoryJob(): Promise<void> {
    throw new Error('Not implemented');
  }
}
