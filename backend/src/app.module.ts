import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { OrdersModule } from './orders/orders.module.js';
import { ProductsModule } from './products/products.module.js';

// The whole backend is one app (a monolith) made of modules.
// Later, each module can become its own microservice.
@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [AppController],
})
export class AppModule {}
