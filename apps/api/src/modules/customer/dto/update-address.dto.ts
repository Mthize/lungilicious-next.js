import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { createAddressDtoSchema } from './create-address.dto.js';

export const updateAddressDtoSchema = createAddressDtoSchema.partial();

export type UpdateAddressDto = z.infer<typeof updateAddressDtoSchema>;

export function parseUpdateAddressDto(value: unknown): UpdateAddressDto {
  try {
    return updateAddressDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
