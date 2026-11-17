import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  // Other modules (orders) may use ProductsService.
  exports: [ProductsService],
})
export class ProductsModule {}
