import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// MySQL returns DECIMAL values as text; this turns them back into numbers.
const decimalToNumber = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

// The "orders" table ("order" is a reserved word in SQL).
// It stores the product's id and name but has no link to the products table,
// so orders can later move to its own database without changes.
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  productId: number;

  @Column({ length: 200 })
  productName: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2, transformer: decimalToNumber })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
