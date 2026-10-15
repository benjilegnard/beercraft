import { Component, inject, output } from '@angular/core';

import type { Product } from '@app/catalog/model';
import { CatalogStore } from '@app/catalog/state';
import { CategoryFilter, ProductCard } from '@app/catalog/ui';

@Component({
  selector: 'app-catalog-page',
  imports: [CategoryFilter, ProductCard],
  template: `
    <h1>Catalog</h1>
    <app-category-filter
      [categories]="store.categories()"
      [selected]="store.selectedCategory()"
      (selectedChange)="store.selectCategory($event)"
    />
    <div class="grid" [attr.aria-busy]="store.productsLoading()">
      @for (product of store.entities(); track product.id) {
        <app-product-card [product]="product" (addToBasket)="addToBasket.emit($event)" />
      } @empty {
        <p>No products.</p>
      }
    </div>
    @if (store.productsError(); as error) {
      <p role="alert">{{ error }}</p>
    }
  `,
})
export class CatalogPage {
  protected readonly store = inject(CatalogStore);
  /** The catalog does not know the basket: the shell decides what "add" means. */
  readonly addToBasket = output<Product>();
}
