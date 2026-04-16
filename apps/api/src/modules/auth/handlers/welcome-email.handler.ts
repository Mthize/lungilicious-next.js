import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { UserRegisteredEvent } from '../../../common/events/auth.events.js';
import { QUEUE_EMAIL } from '../../../common/queue/queue.constants.js';

@Injectable()
export class WelcomeEmailHandler {
  constructor(@InjectQueue(QUEUE_EMAIL) private readonly emailQueue: Queue) {}

  @OnEvent('user.registered')
  async handleWelcomeEmail(event: UserRegisteredEvent): Promise<void> {
    await this.emailQueue.add('welcome-email', {
      userId: event.userId,
      email: event.email,
      firstName: event.firstName,
    });
  }
}
