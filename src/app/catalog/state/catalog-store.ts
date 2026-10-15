import { inject } from '@angular/core';
import { setError, setLoaded, setLoading, withCallState } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

import { CatalogClient } from '@app/catalog/client';
import type { Category, Product } from '@app/catalog/model';

type CatalogState = {
  categories: Category[];
  selectedCategory: string | null;
};

const initialState: CatalogState = {
  categories: [],
  selectedCategory: null,
};

export const CatalogStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Product>(),
  // adds categoriesLoading(), productsLoading(), productsError(), ...
  withCallState({ collections: ['categories', 'products'] }),
  withMethods((store, client = inject(CatalogClient)) => ({
    selectCategory(selectedCategory: string | null): void {
      patchState(store, { selectedCategory });
    },
    loadCategories: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setLoading('categories'))),
        switchMap(() =>
          client.getCategories().pipe(
            tapResponse({
              next: (categories) => patchState(store, { categories }, setLoaded('categories')),
              error: (error) => patchState(store, setError(error, 'categories')),
            }),
          ),
        ),
      ),
    ),
    loadProducts: rxMethod<string | null>(
      pipe(
        tap(() => patchState(store, setLoading('products'))),
        switchMap((category) =>
          client.getProducts(category).pipe(
            tapResponse({
              next: (products) =>
                patchState(store, setAllEntities(products), setLoaded('products')),
              error: (error) => patchState(store, setError(error, 'products')),
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadCategories();
      // reloads products every time the selected category changes
      store.loadProducts(store.selectedCategory);
    },
  }),
);
