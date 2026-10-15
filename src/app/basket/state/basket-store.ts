import { computed } from '@angular/core';
import { patchState, signalStore, type, withComputed, withMethods } from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  removeAllEntities,
  removeEntity,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';

import type { BasketLine } from '@app/basket/model';

const lineConfig = entityConfig({
  entity: type<BasketLine>(),
  selectId: (line) => line.productId,
});

export const BasketStore = signalStore(
  { providedIn: 'root' },
  withEntities(lineConfig),
  withComputed(({ entities }) => ({
    totalQuantity: computed(() => entities().reduce((sum, line) => sum + line.quantity, 0)),
    totalCents: computed(() =>
      entities().reduce((sum, line) => sum + line.priceCents * line.quantity, 0),
    ),
  })),
  withMethods((store) => ({
    add(item: Omit<BasketLine, 'quantity'>): void {
      patchState(
        store,
        store.entityMap()[item.productId]
          ? updateEntity(
              { id: item.productId, changes: (line) => ({ quantity: line.quantity + 1 }) },
              lineConfig,
            )
          : addEntity({ ...item, quantity: 1 }, lineConfig),
      );
    },
    remove(productId: number): void {
      patchState(store, removeEntity(productId));
    },
    clear(): void {
      patchState(store, removeAllEntities());
    },
  })),
);
