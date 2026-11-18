import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto.js';
import { Product } from './product.entity.js';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  // The first time the app starts with an empty table, add a few sample products.
  async onModuleInit() {
    if ((await this.productsRepository.count()) === 0) {
      await this.productsRepository.save([
        { name: 'A5 Notebook', price: 450, stock: 120 },
        { name: 'Ballpoint Pen (Blue)', price: 60, stock: 500 },
        { name: 'Ceramic Mug', price: 1100, stock: 3 },
      ]);
    }
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
    });
    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product ${id} not found`);
    }
  }

  // Used by the orders module. Inside the monolith this is a normal method call.
  async reduceStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    // One UPDATE that only succeeds while there is enough stock, so two orders
    // arriving at the same moment can't sell more than we have.
    const result = await this.productsRepository.decrement(
      { id, stock: MoreThanOrEqual(quantity) },
      'stock',
      quantity,
    );
    if (result.affected === 0) {
      throw new BadRequestException(`Only ${product.stock} "${product.name}" left in stock`);
    }

    product.stock -= quantity;
    return product;
  }
}
