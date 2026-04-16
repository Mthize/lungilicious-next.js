import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator.js';
import { ProductService } from './product.service.js';
import {
  parseProductQueryDto,
  type ProductQueryDto,
} from './dto/product-query.dto.js';

@Public()
@SkipThrottle()
@Controller('products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Get()
  findAll(@Query(ValidationPipe) query: ProductQueryDto) {
    return this.products.findAll(parseProductQueryDto(query));
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }
}
