import { Component, input, output } from '@angular/core';

import type { User } from '@app/users/model';

@Component({
  selector: 'app-user-card',
  template: `
    <article class="card">
      <h2>{{ user().name }}</h2>
      <p>{{ user().email }}</p>
      <button type="button" (click)="signOut.emit()">Sign out</button>
    </article>
  `,
})
export class UserCard {
  readonly user = input.required<User>();
  readonly signOut = output();
}
