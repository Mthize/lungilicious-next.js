import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() _body: Record<string, unknown>) {
    return this.auth.register();
  }

  @Public()
  @Post('login')
  login(@Body() _body: Record<string, unknown>) {
    return this.auth.login();
  }

  @Post('logout')
  logout() {
    return this.auth.logout();
  }

  @Post('refresh')
  refresh() {
    return this.auth.refresh();
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() _body: Record<string, unknown>) {
    return this.auth.forgotPassword();
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() _body: Record<string, unknown>) {
    return this.auth.resetPassword();
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Body() _body: Record<string, unknown>) {
    return this.auth.verifyEmail();
  }

  @Public()
  @Post('mfa/verify')
  mfaVerify(@Body() _body: Record<string, unknown>) {
    return this.auth.verifyMfa();
  }
}
