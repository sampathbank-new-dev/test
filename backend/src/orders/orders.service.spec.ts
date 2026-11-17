import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ProductsService } from '../products/products.service.js';
import { OrdersService } from './orders.service.js';

describe('OrdersService', () => {
  let orders: OrdersService;
  let products: ProductsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [OrdersService, ProductsService],
    }).compile();

    orders = moduleRef.get(OrdersService);
    products = moduleRef.get(ProductsService);
  });

  it('places an order and reduces the stock', () => {
    const product = products.create({ name: 'Test item', price: 100, stock: 5 });

    const order = orders.create({ productId: product.id, quantity: 2 });

    expect(order.productName).toBe('Test item');
    expect(order.totalPrice).toBe(200);
    expect(products.findOne(product.id).stock).toBe(3);
  });

  it('refuses an order when there is not enough stock', () => {
    const product = products.create({ name: 'Test item', price: 100, stock: 1 });

    expect(() => orders.create({ productId: product.id, quantity: 2 })).toThrow(
      BadRequestException,
    );
    expect(products.findOne(product.id).stock).toBe(1);
  });
});
