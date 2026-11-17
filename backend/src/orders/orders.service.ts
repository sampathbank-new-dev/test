import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import type { Order } from './order.entity.js';

@Injectable()
export class OrdersService {
  // Data is kept in memory for now, so it resets when the backend restarts.
  private orders: Order[] = [];
  private nextId = 1;

  constructor(private readonly productsService: ProductsService) {}

  findAll(): Order[] {
    return this.orders;
  }

  create(dto: CreateOrderDto): Order {
    // In the monolith, orders calls the products module directly.
    // When we split into microservices, this line becomes a call over the network.
    const product = this.productsService.reduceStock(dto.productId, dto.quantity);

    const order: Order = {
      id: this.nextId++,
      productId: product.id,
      productName: product.name,
      quantity: dto.quantity,
      totalPrice: Math.round(product.price * dto.quantity * 100) / 100,
      createdAt: new Date().toISOString(),
    };
    this.orders.push(order);
    return order;
  }
}
