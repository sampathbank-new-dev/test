import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import type { Order } from './order.entity.js';
import { OrdersService } from './orders.service.js';

// Handles every URL under /api/orders
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // GET /api/orders
  @Get()
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  // POST /api/orders
  @Post()
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }
}
