import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const loginDtoSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;

export function parseLoginDto(value: unknown): LoginDto {
  try {
    return loginDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
