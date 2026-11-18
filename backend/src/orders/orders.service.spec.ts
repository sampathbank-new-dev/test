import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from '../products/products.service.js';
import { Order } from './order.entity.js';
import { OrdersService } from './orders.service.js';

// Unit test: no database. ProductsService and the orders table are replaced by simple fakes.
describe('OrdersService', () => {
  async function setup(reduceStock: ProductsService['reduceStock']) {
    const ordersRepository = {
      create: vi.fn((data: Partial<Order>) => data),
      save: vi.fn(async (data: Partial<Order>) => ({ id: 1, createdAt: new Date(), ...data })),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ProductsService, useValue: { reduceStock: vi.fn(reduceStock) } },
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
      ],
    }).compile();
    return { orders: moduleRef.get(OrdersService), ordersRepository };
  }

  it("places an order using the product's name and price", async () => {
    const { orders } = await setup(async () => ({ id: 7, name: 'Test item', price: 100, stock: 3 }));

    const order = await orders.create({ productId: 7, quantity: 2 });

    expect(order).toMatchObject({ productId: 7, productName: 'Test item', quantity: 2, totalPrice: 200 });
  });

  it('does not save an order when there is not enough stock', async () => {
    const { orders, ordersRepository } = await setup(async () => {
      throw new BadRequestException('Only 1 "Test item" left in stock');
    });

    await expect(orders.create({ productId: 7, quantity: 2 })).rejects.toThrow(BadRequestException);
    expect(ordersRepository.save).not.toHaveBeenCalled();
  });
});
