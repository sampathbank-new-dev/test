import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Every URL starts with /api, for example GET /api/products.
  // Nginx (on the server) and Vite (on your computer) forward /api to this app.
  app.setGlobalPrefix('api');

  // Check every request body against its DTO class (see the dto/ folders).
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 127.0.0.1 means only this machine can connect; visitors come in through Nginx.
  await app.listen(process.env.PORT ?? 3000, '127.0.0.1');
}
await bootstrap();
