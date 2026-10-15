import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./catalog-route').then((m) => m.CatalogRoute) },
  { path: 'basket', loadComponent: () => import('./basket-route').then((m) => m.BasketRoute) },
  { path: 'orders', loadComponent: () => import('./orders-route').then((m) => m.OrdersRoute) },
  {
    path: 'account',
    loadComponent: () => import('@app/users/feature').then((m) => m.AccountPage),
  },
  { path: '**', redirectTo: '' },
];
