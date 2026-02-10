import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Base URL for your Laravel API in Docker
  private apiUrl = 'http://localhost:3000/api'; 

  private http = inject(HttpClient);

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      name: user.nom,      
      email: user.email,
      password: user.password,
      password_confirmation: user.password 
    });
  }

  /* --- Session Management --- */

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  // FIXED: Ensure you also save the user object after login to use it in Dashboard
  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Retrieves the current user from localStorage.
   * Essential for the Dashboard to check id_user_createur and roles.
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('user');
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      console.error("Could not parse user from storage", e);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Force redirect to clean state
  }
}