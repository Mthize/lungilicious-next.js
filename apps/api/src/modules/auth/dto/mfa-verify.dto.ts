import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const mfaVerifyDtoSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
  factorId: z.string().uuid(),
});

export type MfaVerifyDto = z.infer<typeof mfaVerifyDtoSchema>;

export function parseMfaVerifyDto(value: unknown): MfaVerifyDto {
  try {
    return mfaVerifyDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
