import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import type { Product } from './product.entity.js';

@Injectable()
export class ProductsService {
  // Data is kept in memory for now, so it resets when the backend restarts.
  // A few sample products so the app isn't empty on first start:
  private products: Product[] = [
    { id: 1, name: 'A5 Notebook', price: 450, stock: 120 },
    { id: 2, name: 'Ballpoint Pen (Blue)', price: 60, stock: 500 },
    { id: 3, name: 'Ceramic Mug', price: 1100, stock: 3 },
  ];
  private nextId = 4;

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  create(dto: CreateProductDto): Product {
    const product: Product = {
      id: this.nextId++,
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
    };
    this.products.push(product);
    return product;
  }

  remove(id: number): void {
    this.findOne(id); // throws 404 if it doesn't exist
    this.products = this.products.filter((p) => p.id !== id);
  }

  // Used by the orders module. Inside the monolith this is a normal method call.
  reduceStock(id: number, quantity: number): Product {
    const product = this.findOne(id);
    if (product.stock < quantity) {
      throw new BadRequestException(`Only ${product.stock} "${product.name}" left in stock`);
    }
    product.stock -= quantity;
    return product;
  }
}
