import { Component, inject } from '@angular/core';

import { UsersStore } from '@app/users/state';
import { RegisterForm, UserCard } from '@app/users/ui';

@Component({
  selector: 'app-account-page',
  imports: [RegisterForm, UserCard],
  template: `
    <h1>Account</h1>
    @if (store.currentUser(); as user) {
      <app-user-card [user]="user" (signOut)="store.signOut()" />
    } @else {
      <app-register-form (register)="store.register($event)" />
      <p>
        or <button type="button" (click)="store.useDemoUser()">continue as the demo user</button>
      </p>
    }
    @if (store.error(); as error) {
      <p role="alert">{{ error }}</p>
    }
  `,
})
export class AccountPage {
  protected readonly store = inject(UsersStore);
}
