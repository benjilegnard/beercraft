import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { BasketPage, injectBasketActions } from '@app/basket/feature';
import { injectPlaceOrder, OrderError } from '@app/orders/feature';
import { injectCurrentUserId } from '@app/users/feature';

/** Route-level composition: the checkout uses basket, users and orders. */
@Component({
  selector: 'app-basket-route',
  imports: [BasketPage, OrderError],
  template: `
    <app-basket-page [signedIn]="userId() !== null" (checkout)="checkout($event)" />
    <app-order-error />
  `,
})
export class BasketRoute {
  private readonly router = inject(Router);
  private readonly basket = injectBasketActions();
  private readonly placeOrder = injectPlaceOrder();
  protected readonly userId = injectCurrentUserId();

  // structural type: the shell may only import features, not models
  protected async checkout(lines: { productId: number; quantity: number }[]) {
    const userId = this.userId();
    if (userId === null) {
      return;
    }
    const items = lines.map(({ productId, quantity }) => ({ productId, quantity }));
    if (await this.placeOrder({ userId, items })) {
      this.basket.clear();
      await this.router.navigate(['/orders']);
    }
  }
}
