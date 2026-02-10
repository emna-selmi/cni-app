import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(this.api);
  }

  create(user: any) {
    return this.http.post(this.api, user);
  }

  update(id: number, user: any) {
    return this.http.put(`${this.api}/${id}`, user);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
