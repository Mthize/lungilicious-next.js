import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator.js';
import { CategoryService } from './category.service.js';

@Public()
@SkipThrottle()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categories: CategoryService) {}

  @Get()
  findAll() {
    return this.categories.findAll();
  }

  @Get('tree')
  getTree() {
    return this.categories.getTree();
  }
}
