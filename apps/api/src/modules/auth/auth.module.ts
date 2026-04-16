import { Module } from '@nestjs/common';
import { QueueModule } from '../../common/queue/queue.module.js';
import { CartModule } from '../cart/cart.module.js';
import { CustomerModule } from '../customer/customer.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { WelcomeEmailHandler } from './handlers/welcome-email.handler.js';
import { MeController } from './me.controller.js';

@Module({
  imports: [QueueModule, CustomerModule, CartModule],
  controllers: [AuthController, MeController],
  providers: [AuthService, WelcomeEmailHandler],
})
export class AuthModule {}
