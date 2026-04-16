import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const registerDtoSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

export type RegisterDto = z.infer<typeof registerDtoSchema>;

export function parseRegisterDto(value: unknown): RegisterDto {
  try {
    return registerDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
