import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-header">
      <div class="container flex-header">
        <h1>🚀 Gestion des Tâches & Collaboration</h1>
        <button (click)="goBack()" class="btn-back">⬅️ Retour</button>
      </div>
    </div>

    <div class="container">
      <div class="task-grid">
        <div class="task-card" *ngFor="let task of tasks">
          <div class="task-meta">
            <span class="priority-tag" [attr.data-priority]="task.priorite">{{ task.priorite }}</span>
            <span class="status-badge">{{ task.etat }}</span>
          </div>
          
          <h3>{{ task.titre }}</h3>
          <p class="desc">{{ task.description }}</p>

          <div class="status-control">
            <label>Modifier l'état :</label>
            <select [(ngModel)]="task.etat" (change)="updateStatus(task.id_task, task.etat)">
              <option value="Nouveau">Nouveau</option>
              <option value="En cours">En cours</option>
              <option value="En attente">En attente</option> <option value="Terminé">Terminé</option>
            </select>
          </div>

          <div class="comments-area">
            <h6>💬 Commentaires</h6>
            <div class="comment-list">
              <div class="comment-item" *ngFor="let c of task.comments">
                <span class="user-name">{{ c.user?.nom }} :</span> {{ c.content }}
              </div>
            </div>
            <div class="comment-input">
              <input [(ngModel)]="task.tempComment" placeholder="Répondre..." (keyup.enter)="postComment(task)">
              <button (click)="postComment(task)">Envoyer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
    .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .task-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 5px solid #1a237e; }
    .task-meta { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .priority-tag { font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 5px; }
    .priority-tag[data-priority="Haute"] { background: #fee2e2; color: #dc2626; }
    .status-badge { font-size: 12px; color: #666; background: #eee; padding: 2px 6px; border-radius: 4px; }
    .status-control { margin: 15px 0; border-top: 1px solid #f0f0f0; padding-top: 10px; }
    .comment-list { max-height: 100px; overflow-y: auto; margin-bottom: 10px; }
    .user-name { font-weight: bold; color: #1a237e; }
    .comment-input { display: flex; gap: 5px; }
    .comment-input input { flex: 1; padding: 5px; border: 1px solid #ddd; border-radius: 4px; }
    .btn-back { background: #444; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; }
    .admin-header { background: #1a237e; color: white; padding: 15px 0; margin-bottom: 20px;}
    .flex-header { display: flex; align-items: center; justify-content: space-between; max-width: 1100px; margin: 0 auto; padding: 0 20px;}
  `]
})
export class TaskManagementComponent implements OnInit {
  private http = inject(HttpClient);
  tasks: any[] = [];

  ngOnInit() { this.getTasks(); }

  getTasks() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<any[]>('http://localhost:3000/api/tasks', { headers }).subscribe(data => this.tasks = data.map(t => ({ ...t, tempComment: '' })));
  }

  updateStatus(id: number, status: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.patch(`http://localhost:3000/api/tasks/${id}/status`, { etat: status }, { headers }).subscribe();
  }

  postComment(task: any) {
    if (!task.tempComment) return;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.post(`http://localhost:3000/api/tasks/${task.id_task}/comments`, { content: task.tempComment }, { headers }).subscribe(() => {
        task.tempComment = '';
        this.getTasks();
      });
  }

  goBack() { window.history.back(); }
}