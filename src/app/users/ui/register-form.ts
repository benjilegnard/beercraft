import { Component, output, signal } from '@angular/core';
import { email, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';

import type { RegisterRequest } from '@app/users/model';

@Component({
  selector: 'app-register-form',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="registerForm" class="card stack">
      <h2>Register</h2>
      <label>Name <input [formField]="registerForm.name" autocomplete="name" /></label>
      <label
        >Email <input type="email" [formField]="registerForm.email" autocomplete="email"
      /></label>
      <label>
        Password (8+ chars)
        <input type="password" [formField]="registerForm.password" autocomplete="new-password" />
      </label>
      <button type="submit" [disabled]="registerForm().invalid()">Register</button>
    </form>
  `,
})
export class RegisterForm {
  readonly register = output<RegisterRequest>();

  private readonly model = signal<RegisterRequest>({ name: '', email: '', password: '' });

  protected readonly registerForm = form(
    this.model,
    (path) => {
      required(path.name);
      required(path.email);
      email(path.email);
      minLength(path.password, 8);
    },
    {
      submission: {
        action: async (field) => {
          this.register.emit(field().value());
          return undefined;
        },
      },
    },
  );
}
