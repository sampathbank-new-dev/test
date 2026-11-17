import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import type { Product } from './product.entity.js';
import { ProductsService } from './products.service.js';

// Handles every URL under /api/products
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /api/products
  @Get()
  findAll(): Product[] {
    return this.productsService.findAll();
  }

  // POST /api/products
  @Post()
  create(@Body() dto: CreateProductDto): Product {
    return this.productsService.create(dto);
  }

  // DELETE /api/products/:id
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): void {
    this.productsService.remove(id);
  }
}
