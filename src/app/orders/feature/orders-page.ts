import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrdersStore } from '@app/orders/state';
import { OrderCard } from '@app/orders/ui';

@Component({
  selector: 'app-orders-page',
  imports: [OrderCard, RouterLink],
  template: `
    <h1>Orders</h1>
    @if (userId() === null) {
      <p><a routerLink="/account">Sign in</a> to see your orders.</p>
    } @else {
      @if (store.lastOrderId(); as id) {
        <p role="status">Order #{{ id }} placed, thank you!</p>
      }
      <div [attr.aria-busy]="store.ordersLoading()">
        @for (order of store.entities(); track order.id) {
          <app-order-card [order]="order" />
        } @empty {
          <p>No orders yet.</p>
        }
      </div>
      @if (store.ordersError(); as error) {
        <p role="alert">{{ error }}</p>
      }
    }
  `,
})
export class OrdersPage {
  protected readonly store = inject(OrdersStore);
  /** The orders domain does not know users: the shell passes the user id. */
  readonly userId = input<number | null>(null);

  constructor() {
    this.store.loadForUser(this.userId);
  }
}
