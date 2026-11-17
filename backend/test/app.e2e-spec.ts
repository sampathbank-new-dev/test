import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('CBL Shop API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Same settings as src/main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/health', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok' });
  });

  it('GET /api/products returns the sample products', async () => {
    const res = await request(app.getHttpServer()).get('/api/products').expect(200);
    expect(res.body).toHaveLength(3);
  });

  it('POST /api/products validates the body', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .send({ name: '', price: -1 })
      .expect(400);
    expect(res.body.message).toEqual(expect.arrayContaining(['name should not be empty']));
  });

  it('creates a product, orders it and deletes it', async () => {
    const server = app.getHttpServer();

    const created = await request(server)
      .post('/api/products')
      .send({ name: 'USB-C Cable', price: 1250, stock: 10 })
      .expect(201);
    const id = created.body.id;

    const order = await request(server)
      .post('/api/orders')
      .send({ productId: id, quantity: 4 })
      .expect(201);
    expect(order.body).toMatchObject({ productName: 'USB-C Cable', quantity: 4, totalPrice: 5000 });

    await request(server).post('/api/orders').send({ productId: id, quantity: 7 }).expect(400);

    const orders = await request(server).get('/api/orders').expect(200);
    expect(orders.body).toHaveLength(1);

    await request(server).delete(`/api/products/${id}`).expect(204);
    await request(server).delete(`/api/products/${id}`).expect(404);
  });

  it('POST /api/orders returns 404 for an unknown product', () => {
    return request(app.getHttpServer())
      .post('/api/orders')
      .send({ productId: 999, quantity: 1 })
      .expect(404);
  });
});
