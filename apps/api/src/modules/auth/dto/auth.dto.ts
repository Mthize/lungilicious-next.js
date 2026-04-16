import { z } from 'zod';

export const RegisterDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const ForgotPasswordDto = z.object({
  email: z.string().email(),
});

export const ResetPasswordDto = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export const MfaVerifyDto = z.object({
  code: z.string().min(6).max(8),
});

export const VerifyEmailDto = z.object({
  token: z.string(),
});
