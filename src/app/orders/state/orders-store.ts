import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { setError, setLoaded, setLoading, withCallState } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  prependEntity,
  removeAllEntities,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, firstValueFrom, pipe, switchMap, tap } from 'rxjs';

import { OrdersClient } from '@app/orders/client';
import type { CreateOrderRequest, Order } from '@app/orders/model';

type OrdersState = {
  lastOrderId: number | null;
};

/** The API error body is `{ error: string }`. */
const apiError = (error: unknown) =>
  (error instanceof HttpErrorResponse && error.error?.error) || 'Request failed';

export const OrdersStore = signalStore(
  { providedIn: 'root' },
  withState<OrdersState>({ lastOrderId: null }),
  withEntities<Order>(),
  // adds ordersLoading(), ordersError(), checkoutLoading(), checkoutError(), ...
  withCallState({ collections: ['orders', 'checkout'] }),
  withMethods((store, client = inject(OrdersClient)) => ({
    loadForUser: rxMethod<number | null>(
      pipe(
        tap(() => patchState(store, removeAllEntities(), setLoading('orders'))),
        switchMap((userId) =>
          userId === null
            ? EMPTY
            : client.getByUser(userId).pipe(
                tapResponse({
                  next: (orders) => patchState(store, setAllEntities(orders), setLoaded('orders')),
                  error: (error) => patchState(store, setError(apiError(error), 'orders')),
                }),
              ),
        ),
      ),
    ),
    /** Resolves to true when the order is created. */
    async placeOrder(request: CreateOrderRequest): Promise<boolean> {
      patchState(store, setLoading('checkout'));
      try {
        const order = await firstValueFrom(client.create(request));
        patchState(store, prependEntity(order), { lastOrderId: order.id }, setLoaded('checkout'));
        return true;
      } catch (error) {
        patchState(store, setError(apiError(error), 'checkout'));
        return false;
      }
    },
  })),
);
