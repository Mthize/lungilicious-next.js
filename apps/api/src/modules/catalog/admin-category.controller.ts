import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CategoryService } from './category.service.js';
import {
  parseCreateCategoryDto,
  type CreateCategoryDto,
} from './dto/create-category.dto.js';
import {
  parseUpdateCategoryDto,
  type UpdateCategoryDto,
} from './dto/update-category.dto.js';

@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly categories: CategoryService) {}

  @Post()
  @Roles('ADMIN', 'EDITOR')
  create(@Body(ValidationPipe) body: CreateCategoryDto) {
    return this.categories.adminCreate(parseCreateCategoryDto(body));
  }

  @Patch(':id')
  @Roles('ADMIN', 'EDITOR')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) body: UpdateCategoryDto,
  ) {
    return this.categories.adminUpdate(id, parseUpdateCategoryDto(body));
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.categories.adminDelete(id);
  }
}
