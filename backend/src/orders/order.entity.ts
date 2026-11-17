// What an order looks like. The product's name is copied in when the order is placed.
export interface Order {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}
