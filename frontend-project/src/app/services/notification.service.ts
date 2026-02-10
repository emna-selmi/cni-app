import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Ajout de l'import
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private router = inject(Router); // Injecter le Router ici
  private apiUrl = 'http://localhost:3000/api/notifications';

  toasts = signal<{ id: number; msg: string; type: string }[]>([]);

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // LA MÉTHODE À AJOUTER
  // notification.service.ts
goToNotification(notif: any) {
  this.http.put(`${this.apiUrl}/${notif.id}/read`, {}).subscribe({
    next: () => {
      notif.is_read = 1; // Le badge du dashboard va baisser grâce à ça !
      
      if (notif.type === 'task' || notif.type === 'tâche') {
          // Utilise l'ID présent dans la notification
          const id = notif.target_id || notif.id_task;
          this.router.navigate(['/tasks', id]); // Vérifie ton app.routes.ts !
      } else {
          this.router.navigate(['/project', notif.target_id]);
      }
    }
  });
}

  show(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = Date.now();
    this.toasts.update(t => [...t, { id, msg, type }]);
    setTimeout(() => this.removeToast(id), 4000);
  }

  removeToast(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}