import { inject } from '@angular/core';

import { UsersStore } from '@app/users/state';

/** Public read-only access to the signed-in user id, without exposing the store. */
export function injectCurrentUserId() {
  return inject(UsersStore).userId;
}
