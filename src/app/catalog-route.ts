import { Component } from '@angular/core';

import { injectBasketActions } from '@app/basket/feature';
import { CatalogPage } from '@app/catalog/feature';

/** Route-level composition: catalog and basket meet here, never inside a domain. */
@Component({
  selector: 'app-catalog-route',
  imports: [CatalogPage],
  template: `<app-catalog-page (addToBasket)="add($event)" />`,
})
export class CatalogRoute {
  private readonly basket = injectBasketActions();

  // structural type: the shell may only import features, not models
  protected add({ id, name, priceCents }: { id: number; name: string; priceCents: number }) {
    this.basket.add({ productId: id, name, priceCents });
  }
}
