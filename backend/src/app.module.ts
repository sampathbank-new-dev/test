import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { OrdersModule } from './orders/orders.module.js';
import { ProductsModule } from './products/products.module.js';

// The whole backend is one app (a monolith) made of modules.
// Later, each module can become its own microservice.
@Module({
  imports: [
    // Read the database settings from backend/.env (see .env.example).
    // isGlobal: every module (including the database setup below) can use ConfigService.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(import.meta.dirname, '..', '.env') }),

    // One MySQL database for the whole monolith.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.get('DB_PORT', 3306)),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.getOrThrow<string>('DB_NAME'),
        // Amazon RDS: encrypt the connection and check the server's certificate.
        ssl: config.get('DB_SSL') === 'true' ? 'Amazon RDS' : undefined,
        // Use the entities registered by each module (TypeOrmModule.forFeature).
        autoLoadEntities: true,
        // Create and update the tables from the entity classes when the app starts.
        // Handy while learning. Real projects turn this off and use migrations.
        synchronize: true,
      }),
    }),

    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
