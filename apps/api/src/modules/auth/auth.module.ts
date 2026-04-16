import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { MeController } from './me.controller.js';

@Module({
  controllers: [AuthController, MeController],
  providers: [AuthService],
})
export class AuthModule {}
