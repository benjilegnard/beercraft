import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { setError, setLoaded, setLoading, withCallState } from '@angular-architects/ngrx-toolkit';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe, tap, type Observable } from 'rxjs';

import { UsersClient } from '@app/users/client';
import type { RegisterRequest, User } from '@app/users/model';

const DEMO_USER_ID = 1;

type UsersState = {
  currentUser: User | null;
};

/** The API error body is `{ error: string }`. */
const apiError = (error: unknown) =>
  (error instanceof HttpErrorResponse && error.error?.error) || 'Request failed';

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState<UsersState>({ currentUser: null }),
  // adds loading(), loaded(), error()
  withCallState(),
  withComputed(({ currentUser }) => ({
    userId: computed(() => currentUser()?.id ?? null),
  })),
  withMethods((store, client = inject(UsersClient)) => {
    const signIn = <T>(request: (value: T) => Observable<User>) =>
      rxMethod<T>(
        pipe(
          tap(() => patchState(store, setLoading())),
          exhaustMap((value) =>
            request(value).pipe(
              tapResponse({
                next: (currentUser) => patchState(store, { currentUser }, setLoaded()),
                error: (error) => patchState(store, setError(apiError(error))),
              }),
            ),
          ),
        ),
      );

    return {
      register: signIn((request: RegisterRequest) => client.register(request)),
      useDemoUser: signIn<void>(() => client.getById(DEMO_USER_ID)),
      signOut: () => patchState(store, { currentUser: null }),
    };
  }),
);
