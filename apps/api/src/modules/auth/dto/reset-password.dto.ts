import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const resetPasswordDtoSchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string().min(8),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordDtoSchema>;

export function parseResetPasswordDto(value: unknown): ResetPasswordDto {
  try {
    return resetPasswordDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
