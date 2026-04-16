import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const addCartItemDtoSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
});

export type AddCartItemDto = z.infer<typeof addCartItemDtoSchema>;

export function parseAddCartItemDto(value: unknown): AddCartItemDto {
  try {
    return addCartItemDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
