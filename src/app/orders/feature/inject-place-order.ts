import { inject } from '@angular/core';

import type { CreateOrderRequest } from '@app/orders/model';
import { OrdersStore } from '@app/orders/state';

/** Public order action for the app shell, without exposing the store. */
export function injectPlaceOrder() {
  const store = inject(OrdersStore);
  return (request: CreateOrderRequest) => store.placeOrder(request);
}
