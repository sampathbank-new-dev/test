import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Order } from './order.entity.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly productsService: ProductsService,
  ) {}

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find({ order: { id: 'ASC' } });
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    // In the monolith, orders calls the products module directly.
    // When we split into microservices, this line becomes a call over the network.
    const product = await this.productsService.reduceStock(dto.productId, dto.quantity);

    const order = this.ordersRepository.create({
      productId: product.id,
      productName: product.name,
      quantity: dto.quantity,
      totalPrice: Math.round(product.price * dto.quantity * 100) / 100,
    });
    return this.ordersRepository.save(order);
  }
}
