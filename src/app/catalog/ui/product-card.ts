import { Component, input, output } from '@angular/core';

import type { Product } from '@app/catalog/model';
import { PricePipe } from '@app/shared/ui';

@Component({
  selector: 'app-product-card',
  imports: [PricePipe],
  template: `
    <article class="card">
      <h3>{{ product().name }}</h3>
      <p>{{ product().category.name }} · {{ product().abv }}% ABV</p>
      <p>{{ product().description }}</p>
      <p>
        <strong>{{ product().priceCents | price }}</strong>
        <span> · {{ product().stock }} in stock</span>
      </p>
      <button
        type="button"
        [disabled]="product().stock === 0"
        (click)="addToBasket.emit(product())"
      >
        Add to basket
      </button>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly addToBasket = output<Product>();
}
