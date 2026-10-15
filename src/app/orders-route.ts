import { Component } from '@angular/core';

import { OrdersPage } from '@app/orders/feature';
import { injectCurrentUserId } from '@app/users/feature';

/** Route-level composition: orders and users meet here, never inside a domain. */
@Component({
  selector: 'app-orders-route',
  imports: [OrdersPage],
  template: `<app-orders-page [userId]="userId()" />`,
})
export class OrdersRoute {
  protected readonly userId = injectCurrentUserId();
}
