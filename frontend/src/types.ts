// The shape of the data the frontend and the backend exchange.
// The NestJS backend (next step) will send and accept exactly these shapes.

export interface Product {
  id: number
  name: string
  price: number
  stock: number
}

export interface Order {
  id: number
  productId: number
  productName: string
  quantity: number
  totalPrice: number
  createdAt: string
}

export interface CreateProductInput {
  name: string
  price: number
  stock: number
}

export interface CreateOrderInput {
  productId: number
  quantity: number
}
