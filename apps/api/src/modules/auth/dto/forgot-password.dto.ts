import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const forgotPasswordDtoSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordDtoSchema>;

export function parseForgotPasswordDto(value: unknown): ForgotPasswordDto {
  try {
    return forgotPasswordDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
