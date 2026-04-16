import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { createProductDtoSchema } from './create-product.dto.js';

export const updateProductDtoSchema = createProductDtoSchema.partial();

export type UpdateProductDto = z.infer<typeof updateProductDtoSchema>;

export function parseUpdateProductDto(value: unknown): UpdateProductDto {
  try {
    return updateProductDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(error.issues.map((issue) => issue.message).join(', '));
    }

    throw error;
  }
}
