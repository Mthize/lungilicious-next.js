import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../common/decorators/public.decorator.js';
import { AuthService } from './auth.service.js';
import {
  parseForgotPasswordDto,
  type ForgotPasswordDto,
} from './dto/forgot-password.dto.js';
import { parseLoginDto, type LoginDto } from './dto/login.dto.js';
import {
  parseMfaVerifyDto,
  type MfaVerifyDto,
} from './dto/mfa-verify.dto.js';
import { parseRegisterDto, type RegisterDto } from './dto/register.dto.js';
import {
  parseResetPasswordDto,
  type ResetPasswordDto,
} from './dto/reset-password.dto.js';
import {
  parseVerifyEmailDto,
  type VerifyEmailDto,
} from './dto/verify-email.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ short: { limit: 5, ttl: 60000 }, long: { limit: 20, ttl: 600000 } })
  @Post('register')
  async register(
    @Body(ValidationPipe) body: RegisterDto,
    @Req() request: FastifyRequest,
  ) {
    const registerDto = parseRegisterDto(body);
    const user = await this.auth.register(registerDto);
    const session = request.session as { set: (key: string, value: unknown) => void };

    session.set('userId', user.id);

    return user;
  }

  @Public()
  @Throttle({ short: { limit: 10, ttl: 60000 }, long: { limit: 50, ttl: 600000 } })
  @Post('login')
  async login(
    @Body(ValidationPipe) body: LoginDto,
    @Req() request: FastifyRequest,
  ) {
    const loginDto = parseLoginDto(body);

    return this.auth.login(loginDto, request);
  }

  @Throttle({ short: { limit: 10, ttl: 60000 }, long: { limit: 50, ttl: 600000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Req() request: FastifyRequest) {
    await this.auth.logout(request);
  }

  @Throttle({ short: { limit: 10, ttl: 60000 }, long: { limit: 50, ttl: 600000 } })
  @Post('refresh')
  refresh(@Req() request: FastifyRequest) {
    return this.auth.refresh(request);
  }

  @Public()
  @Throttle({ short: { limit: 3, ttl: 60000 }, long: { limit: 10, ttl: 600000 } })
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('forgot-password')
  async forgotPassword(@Body(ValidationPipe) body: ForgotPasswordDto) {
    const forgotPasswordDto = parseForgotPasswordDto(body);

    await this.auth.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Throttle({ short: { limit: 3, ttl: 60000 }, long: { limit: 10, ttl: 600000 } })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body(ValidationPipe) body: ResetPasswordDto) {
    const resetPasswordDto = parseResetPasswordDto(body);

    await this.auth.resetPassword(resetPasswordDto);
  }

  @Public()
  @Throttle({ short: { limit: 3, ttl: 60000 }, long: { limit: 10, ttl: 600000 } })
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body(ValidationPipe) body: VerifyEmailDto) {
    const verifyEmailDto = parseVerifyEmailDto(body);

    await this.auth.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Throttle({ short: { limit: 5, ttl: 60000 }, long: { limit: 20, ttl: 600000 } })
  @HttpCode(HttpStatus.OK)
  @Post('mfa/verify')
  mfaVerify(
    @Body(ValidationPipe) body: MfaVerifyDto,
    @Req() request: FastifyRequest,
  ) {
    return this.auth.verifyMfa(parseMfaVerifyDto(body), request);
  }
}
