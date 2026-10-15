import { Component, input, output } from '@angular/core';

import type { Category } from '@app/catalog/model';

@Component({
  selector: 'app-category-filter',
  template: `
    <nav aria-label="Categories" class="filters">
      <button
        type="button"
        [attr.aria-pressed]="selected() === null"
        (click)="selectedChange.emit(null)"
      >
        All
      </button>
      @for (category of categories(); track category.id) {
        <button
          type="button"
          [attr.aria-pressed]="selected() === category.slug"
          (click)="selectedChange.emit(category.slug)"
        >
          {{ category.name }}
        </button>
      }
    </nav>
  `,
})
export class CategoryFilter {
  readonly categories = input.required<Category[]>();
  readonly selected = input<string | null>(null);
  readonly selectedChange = output<string | null>();
}
