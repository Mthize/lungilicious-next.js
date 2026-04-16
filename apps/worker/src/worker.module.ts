import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  QUEUE_EMAIL,
  QUEUE_NOTIFICATIONS,
  QUEUE_WEBHOOKS,
  QUEUE_INVENTORY,
  QUEUE_EXPORTS,
} from './queues.constants.js';
import { EmailProcessor } from './processors/email.processor.js';
import { NotificationsProcessor } from './processors/notifications.processor.js';
import { WebhooksProcessor } from './processors/webhooks.processor.js';
import { InventoryProcessor } from './processors/inventory.processor.js';
import { ExportsProcessor } from './processors/exports.processor.js';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          url: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
        },
      }),
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
    EmailProcessor,
    NotificationsProcessor,
    WebhooksProcessor,
    InventoryProcessor,
    ExportsProcessor,
  ],
})
export class WorkerModule {}
