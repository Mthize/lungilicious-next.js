import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const createCategoryDtoSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type CreateCategoryDto = z.infer<typeof createCategoryDtoSchema>;

export function parseCreateCategoryDto(value: unknown): CreateCategoryDto {
  try {
    return createCategoryDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(error.issues.map((issue) => issue.message).join(', '));
    }

    throw error;
  }
}
