import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import type { Order } from '@app/orders/model';
import { PricePipe } from '@app/shared/ui';

@Component({
  selector: 'app-order-card',
  imports: [DatePipe, PricePipe],
  template: `
    <article class="card row">
      <span>Order #{{ order().id }} · {{ order().createdAt | date: 'medium' }}</span>
      <span>{{ order().items.length }} item(s) · {{ order().status }}</span>
      <strong>{{ order().totalCents | price }}</strong>
    </article>
  `,
})
export class OrderCard {
  readonly order = input.required<Order>();
}
