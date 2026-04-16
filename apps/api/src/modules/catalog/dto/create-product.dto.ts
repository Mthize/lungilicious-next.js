import { BadRequestException } from '@nestjs/common';
import { z, ZodError } from 'zod';

const productStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

const productVariantPriceSchema = z.object({
  amount: z.coerce.number(),
  currency: z.string().trim().min(1).default('ZAR'),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

const productVariantSchema = z.object({
  sku: z.string().trim().min(1),
  name: z.string().trim().min(1),
  price: z.coerce.number(),
  compareAtPrice: z.coerce.number().nullable().optional(),
  isDefault: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
  prices: z.array(productVariantPriceSchema).default([]),
  stock: z.coerce.number().int().min(0).optional(),
});

const productImageSchema = z.object({
  url: z.string().trim().url(),
  altText: z.string().trim().min(1),
  caption: z.string().trim().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

const productSeoSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  canonicalUrl: z.string().trim().url().optional(),
  openGraphImage: z.string().trim().url().optional(),
});

export const createProductDtoSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().min(1),
  categoryIds: z.array(z.string().uuid()).min(1),
  status: productStatusSchema.default('DRAFT'),
  variants: z.array(productVariantSchema).default([]),
  images: z.array(productImageSchema).default([]),
  seo: productSeoSchema.optional(),
});

export type CreateProductDto = z.infer<typeof createProductDtoSchema>;

export function parseCreateProductDto(value: unknown): CreateProductDto {
  try {
    return createProductDtoSchema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(error.issues.map((issue) => issue.message).join(', '));
    }

    throw error;
  }
}
