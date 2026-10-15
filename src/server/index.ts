import { Hono } from 'hono';

import categoriesApi from './api/categories-api';
import ordersApi from './api/orders-api';
import productsApi from './api/products-api';
import usersApi from './api/users-api';

/**
 * REST API, mounted under `/api` in `src/server.ts`
 */
export const api = new Hono()
  .route('/categories', categoriesApi)
  .route('/products', productsApi)
  .route('/users', usersApi)
  .route('/orders', ordersApi);

export type Api = typeof api;
