export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPriceCents: number;
};

export type Order = {
  id: number;
  userId: number;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
};

export type CreateOrderRequest = {
  userId: number;
  items: { productId: number; quantity: number }[];
};
