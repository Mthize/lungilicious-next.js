import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const verifyEmailDtoSchema = z.object({
  token: z.string().uuid(),
});

export type VerifyEmailDto = z.infer<typeof verifyEmailDtoSchema>;

export function parseVerifyEmailDto(value: unknown): VerifyEmailDto {
  try {
    return verifyEmailDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
