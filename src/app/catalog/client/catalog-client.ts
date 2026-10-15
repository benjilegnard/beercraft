import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type { Category, Product } from '@app/catalog/model';

@Injectable({ providedIn: 'root' })
export class CatalogClient {
  private readonly http = inject(HttpClient);

  getCategories() {
    return this.http.get<Category[]>('/api/categories');
  }

  getProducts(category: string | null) {
    const params: Record<string, string> = category ? { category } : {};
    return this.http.get<Product[]>('/api/products', { params });
  }
}
