import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

// The body of POST /api/products. ValidationPipe rejects anything that breaks these rules.
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;
}
