import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type { CreateOrderRequest, Order } from '@app/orders/model';

@Injectable({ providedIn: 'root' })
export class OrdersClient {
  private readonly http = inject(HttpClient);

  getByUser(userId: number) {
    return this.http.get<Order[]>('/api/orders', { params: { userId } });
  }

  create(request: CreateOrderRequest) {
    return this.http.post<Order>('/api/orders', request);
  }
}
