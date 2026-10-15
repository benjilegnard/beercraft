import { Component, input, output } from '@angular/core';

import type { BasketLine } from '@app/basket/model';
import { PricePipe } from '@app/shared/ui';

@Component({
  selector: 'app-basket-line-card',
  imports: [PricePipe],
  template: `
    <article class="card row">
      <span>{{ line().quantity }} × {{ line().name }}</span>
      <strong>{{ line().priceCents * line().quantity | price }}</strong>
      <button type="button" (click)="remove.emit(line().productId)">
        Remove <span class="visually-hidden">{{ line().name }}</span>
      </button>
    </article>
  `,
})
export class BasketLineCard {
  readonly line = input.required<BasketLine>();
  readonly remove = output<number>();
}
