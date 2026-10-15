import { Component, inject } from '@angular/core';

import { OrdersStore } from '@app/orders/state';

/** Smart widget showing the last order error, for any page that places orders. */
@Component({
  selector: 'app-order-error',
  template: `
    @if (store.checkoutError(); as error) {
      <p role="alert">{{ error }}</p>
    }
  `,
})
export class OrderError {
  protected readonly store = inject(OrdersStore);
}
