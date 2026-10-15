import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type { RegisterRequest, User } from '@app/users/model';

@Injectable({ providedIn: 'root' })
export class UsersClient {
  private readonly http = inject(HttpClient);

  register(request: RegisterRequest) {
    return this.http.post<User>('/api/users', request);
  }

  getById(id: number) {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
