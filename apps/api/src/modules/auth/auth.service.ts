import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  register(): Promise<void> {
    throw new NotImplementedException('Registration not yet implemented');
  }

  login(): Promise<void> {
    throw new NotImplementedException('Login not yet implemented');
  }

  logout(): Promise<void> {
    throw new NotImplementedException('Logout not yet implemented');
  }

  refresh(): Promise<void> {
    throw new NotImplementedException('Session refresh not yet implemented');
  }

  forgotPassword(): Promise<void> {
    throw new NotImplementedException('Forgot password not yet implemented');
  }

  resetPassword(): Promise<void> {
    throw new NotImplementedException('Reset password not yet implemented');
  }

  verifyEmail(): Promise<void> {
    throw new NotImplementedException('Email verification not yet implemented');
  }

  verifyMfa(): Promise<void> {
    throw new NotImplementedException('MFA verification not yet implemented');
  }
}
