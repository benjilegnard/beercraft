import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { BasketLine } from '@app/basket/model';
import { BasketStore } from '@app/basket/state';
import { BasketLineCard } from '@app/basket/ui';
import { PricePipe } from '@app/shared/ui';

@Component({
  selector: 'app-basket-page',
  imports: [BasketLineCard, PricePipe, RouterLink],
  template: `
    <h1>Basket</h1>
    @for (line of store.entities(); track line.productId) {
      <app-basket-line-card [line]="line" (remove)="store.remove($event)" />
    } @empty {
      <p>Your basket is empty. <a routerLink="/">Browse the catalog</a>.</p>
    }
    @if (store.totalQuantity() > 0) {
      <p>
        Total: <strong>{{ store.totalCents() | price }}</strong>
      </p>
      @if (signedIn()) {
        <button type="button" (click)="checkout.emit(store.entities())">Place order</button>
      } @else {
        <p><a routerLink="/account">Sign in</a> to place your order.</p>
      }
    }
  `,
})
export class BasketPage {
  protected readonly store = inject(BasketStore);
  /** The basket knows neither users nor orders: the shell handles the checkout. */
  readonly signedIn = input(false);
  readonly checkout = output<BasketLine[]>();
}
