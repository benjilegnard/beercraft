import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { BasketIndicator } from '@app/basket/feature';

@Component({
  selector: 'app-root',
  imports: [BasketIndicator, RouterLink, RouterOutlet],
  template: `
    <header>
      <a routerLink="/" class="brand">Beercraft</a>
      <nav aria-label="Main">
        <a routerLink="/">Catalog</a>
        <a routerLink="/orders">Orders</a>
        <a routerLink="/account">Account</a>
        <app-basket-indicator />
      </nav>
    </header>
    <main>
      <router-outlet />
    </main>
  `,
})
export class App {}
