import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module.js';
import { AdminCategoryController } from './admin-category.controller.js';
import { AdminProductController } from './admin-product.controller.js';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';
import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [
    ProductController,
    CategoryController,
    AdminProductController,
    AdminCategoryController,
  ],
  providers: [ProductService, CategoryService],
  exports: [ProductService, CategoryService],
})
export class CatalogModule {}
