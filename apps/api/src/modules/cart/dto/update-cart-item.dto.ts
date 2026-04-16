import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const updateCartItemDtoSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export type UpdateCartItemDto = z.infer<typeof updateCartItemDtoSchema>;

export function parseUpdateCartItemDto(value: unknown): UpdateCartItemDto {
  try {
    return updateCartItemDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
