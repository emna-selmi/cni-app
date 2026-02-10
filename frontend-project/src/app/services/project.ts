import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';
  
  projects = signal<any[]>([]);

  // --- Helper Configuration ---
  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // --- Gestion des Projets ---
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`, { headers: this.getHeaders() }).pipe(
      tap(res => this.projects.set(res))
    );
  }

  getProjectById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/projects/${id}`, { headers: this.getHeaders() });
  }


getTasksByProject(projectId: number): Observable<any[]> {
  const token = localStorage.getItem('token'); // Récupération du token
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  return this.http.get<any[]>(`http://localhost:3000/api/projects/${projectId}/tasks`, { headers });
}

  createProject(project: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects`, project, { headers: this.getHeaders() });
  }

  deleteProject(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${id}`, { headers: this.getHeaders() });
  }

  // À ajouter dans la classe ProjectService

getProjectComments(projectId: number): Observable<any[]> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
  return this.http.get<any[]>(`http://localhost:3000/api/projects/${projectId}/comments`, { headers });
}

postProjectComment(commentData: { id_project: number, contenu: string }): Observable<any> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
  // Vérifiez si votre API attend /projects/{id}/comments
  return this.http.post(`http://localhost:3000/api/projects/${commentData.id_project}/comments`, 
    { contenu: commentData.contenu }, 
    { headers }
  );
}

  // --- Gestion des Membres ---
  getProjectMembers(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects/${projectId}/members`, { headers: this.getHeaders() });
  }

  addMember(projectId: number, memberData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects/${projectId}/members`, memberData, { headers: this.getHeaders() });
  }
}