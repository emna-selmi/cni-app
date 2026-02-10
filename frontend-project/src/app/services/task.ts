import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs'; // <--- AJOUTEZ CETTE LIGNE (CRITIQUE)

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // Correction : Utilisez 'status' pour correspondre à votre erreur SQL Laravel
  updateStatus(taskId: number, newStatus: string) {
  return this.http.put(`http://localhost:3000/api/tasks/${taskId}/status`, { 
    etat: newStatus // Utilisez 'etat' pour correspondre à Laravel
  }, { headers: this.getHeaders() });
}

  getByProject(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects/${id}/tasks`, { headers: this.getHeaders() });
  }

  getTasksByProject(id: number) {
    return this.getByProject(id);
  }

  createTask(task: any) {
    return this.http.post(`${this.apiUrl}/tasks`, task, { headers: this.getHeaders() });
  }

  assignTask(taskId: number, userId: number) {
    return this.http.put(`${this.apiUrl}/tasks/${taskId}/assign`, 
      { id_user: userId }, 
      { headers: this.getHeaders() }
    );
  }

  // Récupération des notifications
  getNotifications(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/notifications`, { headers: this.getHeaders() }).pipe(
      map(response => {
        // Laravel renvoie souvent les données dans un objet 'data'
        return Array.isArray(response) ? response : (response.data || []);
      })
    );
  }
}