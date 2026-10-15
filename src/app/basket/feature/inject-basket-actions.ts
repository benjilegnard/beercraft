import { inject } from '@angular/core';

import type { BasketLine } from '@app/basket/model';
import { BasketStore } from '@app/basket/state';

/** Public basket actions for the app shell, without exposing the store. */
export function injectBasketActions() {
  const store = inject(BasketStore);
  return {
    add: (item: Omit<BasketLine, 'quantity'>) => store.add(item),
    clear: () => store.clear(),
  };
}
