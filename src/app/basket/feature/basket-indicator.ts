import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BasketStore } from '@app/basket/state';

/** Smart widget for the app shell header. */
@Component({
  selector: 'app-basket-indicator',
  imports: [RouterLink],
  template: `<a routerLink="/basket">Basket ({{ store.totalQuantity() }})</a>`,
})
export class BasketIndicator {
  protected readonly store = inject(BasketStore);
}
