import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

// End-to-end test: starts the real app and talks to the MySQL database set in backend/.env.
describe('CBL Shop API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Same settings as src/main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok' });
  });

  it('GET /api/products returns products with numeric prices', async () => {
    const res = await request(app.getHttpServer()).get('/api/products').expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(typeof res.body[0].price).toBe('number');
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
      .send({ name: 'E2E test cable', price: 1250.5, stock: 10 })
      .expect(201);
    const id = created.body.id;

    const order = await request(server)
      .post('/api/orders')
      .send({ productId: id, quantity: 4 })
      .expect(201);
    expect(order.body).toMatchObject({ productName: 'E2E test cable', quantity: 4, totalPrice: 5002 });
    expect(order.body.id).toBeGreaterThan(0);
    expect(order.body.createdAt).toBeTruthy();

    // Only 6 left now, so 7 is refused and the stock stays at 6.
    await request(server).post('/api/orders').send({ productId: id, quantity: 7 }).expect(400);
    const products = await request(server).get('/api/products').expect(200);
    expect(products.body.find((p: { id: number }) => p.id === id).stock).toBe(6);

    const orders = await request(server).get('/api/orders').expect(200);
    expect(orders.body.some((o: { id: number }) => o.id === order.body.id)).toBe(true);

    await request(server).delete(`/api/products/${id}`).expect(204);
    await request(server).delete(`/api/products/${id}`).expect(404);
  });

  it('POST /api/orders returns 404 for an unknown product', () => {
    return request(app.getHttpServer())
      .post('/api/orders')
      .send({ productId: 999999, quantity: 1 })
      .expect(404);
  });
});
