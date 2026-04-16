import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { ProductService } from './product.service.js';
import {
  parseCreateProductDto,
  type CreateProductDto,
} from './dto/create-product.dto.js';
import { parseProductQueryDto, type ProductQueryDto } from './dto/product-query.dto.js';
import {
  parseUpdateProductDto,
  type UpdateProductDto,
} from './dto/update-product.dto.js';

@Controller('admin/products')
export class AdminProductController {
  constructor(private readonly products: ProductService) {}

  @Post()
  @Roles('ADMIN', 'EDITOR')
  create(@Body(ValidationPipe) body: CreateProductDto) {
    return this.products.adminCreate(parseCreateProductDto(body));
  }

  @Get()
  @Roles('ADMIN', 'EDITOR', 'OPS')
  findAll(@Query(ValidationPipe) query: ProductQueryDto) {
    return this.products.adminFindAll(parseProductQueryDto(query));
  }

  @Get(':id')
  @Roles('ADMIN', 'EDITOR')
  findById(@Param('id') id: string) {
    return this.products.adminFindById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'EDITOR')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) body: UpdateProductDto,
  ) {
    return this.products.adminUpdate(id, parseUpdateProductDto(body));
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.products.adminSoftDelete(id);
  }
}
