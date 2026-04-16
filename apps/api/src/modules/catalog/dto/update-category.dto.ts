import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { createCategoryDtoSchema } from './create-category.dto.js';

export const updateCategoryDtoSchema = createCategoryDtoSchema.partial();

export type UpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;

export function parseUpdateCategoryDto(value: unknown): UpdateCategoryDto {
  try {
    return updateCategoryDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(error.issues.map((issue) => issue.message).join(', '));
    }

    throw error;
  }
}
