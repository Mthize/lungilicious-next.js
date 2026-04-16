import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const applyCouponDtoSchema = z.object({
  code: z.string().trim().min(1),
});

export type ApplyCouponDto = z.infer<typeof applyCouponDtoSchema>;

export function parseApplyCouponDto(value: unknown): ApplyCouponDto {
  try {
    return applyCouponDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
