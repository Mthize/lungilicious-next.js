import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

export const createAddressDtoSchema = z.object({
  label: z.string().trim().min(1).optional(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  line1: z.string().trim().min(1),
  line2: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1),
  province: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().min(1).default('ZA'),
  isDefault: z.boolean().default(false),
  phone: z.string().trim().min(1).optional(),
});

export type CreateAddressDto = z.infer<typeof createAddressDtoSchema>;

export function parseCreateAddressDto(value: unknown): CreateAddressDto {
  try {
    return createAddressDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map((issue) => issue.message).join(', '),
      );
    }

    throw error;
  }
}
