import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const updateProfileDtoSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  avatarUrl: z.string().trim().url().optional(),
  marketingConsent: z.boolean().optional(),
  communicationConsent: z.boolean().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDtoSchema>;

export function parseUpdateProfileDto(value: unknown): UpdateProfileDto {
  try {
    return updateProfileDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
