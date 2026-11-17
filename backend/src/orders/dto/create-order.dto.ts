import { IsInt, Min } from 'class-validator';

// The body of POST /api/orders.
export class CreateOrderDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
