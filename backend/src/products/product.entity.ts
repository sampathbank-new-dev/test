import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// MySQL returns DECIMAL values as text; this turns them back into numbers.
const decimalToNumber = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

// The "products" table. TypeORM creates it from this class.
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: decimalToNumber })
  price: number;

  @Column('int')
  stock: number;
}
