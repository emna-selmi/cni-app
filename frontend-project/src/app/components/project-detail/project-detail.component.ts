import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs'; 
import { TaskService } from '../../services/task'; 
import { NotificationService } from '../../services/notification.service';
import { ProjectService } from '../../services/project';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="toast-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;">
  <div *ngFor="let toast of notifService.toasts()" 
       class="toast" 
       [ngClass]="toast.type"
       style="padding: 15px 20px; border-radius: 8px; color: white; display: flex; justify-content: space-between; align-items: center; min-width: 250px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: slideIn 0.3s ease-out;">
    
    <span style="font-weight: 500;">{{ toast.msg }}</span>
    
    <button (click)="notifService.removeToast(toast.id)" 
            style="background: none; border: none; color: white; cursor: pointer; font-size: 22px; line-height: 1; margin-left: 15px; opacity: 0.8; transition: opacity 0.2s;">
      ×
    </button>
  </div>
</div>

<header class="header-banner">
  <div class="container flex-header">
    <button (click)="goBack()" class="btn-back">← Retour</button>
    <h1>Projet #{{ projectId }} <small>Gestion des Tâches</small></h1>
    <div class="search-box">
      <input type="text" [(ngModel)]="searchQuery" placeholder="🔍 Filtrer les tâches..." class="search-input">
    </div>
  </div>
</header>

<main class="container main-content">
  <section class="supervision-dashboard" *ngIf="isAdmin || isProjectCreator">
    <div class="supervision-header">
      <h2>📊 Tour de Contrôle Admin</h2>
    </div>
    <div class="supervision-grid">
      <div class="super-card warning">
        <h4>🚨 Alertes Supervision</h4>
        <ul>
          <li><strong>{{ countBlocked }}</strong> Tâches bloquées (En attente)</li>
          <li><strong>{{ countUnassigned }}</strong> Tâches sans responsable</li>
        </ul>
      </div>

      <div class="super-card info">
        <h4>⚖️ Charge de l'Équipe</h4>
        <div class="workload-list">
          <div *ngFor="let member of projectMembers" class="workload-item">
            <div class="workload-info">
              <span>{{ member.nom }}</span>
              <small>{{ getUserTaskCount(member.id_user) }} tâches</small>
            </div>
            <div class="workload-bar">
              <div class="workload-fill" [style.width.%]="getUserWorkload(member.id_user)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="super-card activity-log" style="margin-top: 20px;">
  <h4>📜 Journal d'activité (Collaborateurs)</h4>
  <div style="max-height: 200px; overflow-y: auto; font-size: 0.9rem; padding: 10px; background: #fff; border-radius: 8px;">
    
    <div *ngFor="let log of projectLogs" style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; gap: 10px; align-items: center;">
      <span style="color: var(--secondary); font-weight: bold; min-width: 50px;">{{ log.time | date:'HH:mm' }}</span>
      <div>
        <strong>{{ log.user }}</strong> 
        <span style="color: #555;"> {{ log.action }}</span> : 
        <em style="color: #d32f2f; font-weight: 500;">"{{ log.target }}"</em>
      </div>
    </div>

    <div *ngIf="projectLogs.length === 0" style="color: #999; text-align: center; padding: 20px;">
      Aucune activité enregistrée pour ce projet.
    </div>
  </div>
</div>
  </section>

  <section class="progress-section">
    <div class="progress-info">
      <span>Progression du Projet</span>
      <span class="percentage">{{ getCompletionRate() }}%</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-fill" [style.width.%]="getCompletionRate()"></div>
    </div>
  </section>

  <div class="grid-layout">
    <aside class="sidebar-forms">
      <div class="creation-box" *ngIf="isAdmin || isProjectCreator">
        <h3>👥 Équipe du projet</h3>
        <div class="vertical-form">
          <select [(ngModel)]="newMember.id_user">
            <option value="0">Choisir un utilisateur</option>
            <option *ngFor="let u of allUsers" [value]="u.id_user">{{ u.nom }}</option>
          </select>
          <select [(ngModel)]="newMember.role_projet">
            <option value="Chef de projet">Chef de projet</option>
            <option value="Développeur">Développeur</option>
            <option value="Testeur">Testeur</option>
          </select>
          <button (click)="addMemberToProject()" class="btn-primary">Ajouter au projet</button>
        </div>
      </div>

      <div class="creation-box" *ngIf="isAdmin || isProjectCreator">
        <h3>✨ Nouvelle Tâche</h3>
        <div class="vertical-form">
          <input type="text" [(ngModel)]="newTask.titre" placeholder="Titre de la tâche">
          <textarea [(ngModel)]="newTask.description" placeholder="Description..."></textarea>
          <select [(ngModel)]="newTask.priorite">
            <option value="Basse">Basse</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Haute">Haute</option>
          </select>
          <button (click)="addTask()" class="btn-primary">Créer la tâche</button>
        </div>
      </div>
    </aside>

    <section class="kanban-wrapper">
      <div class="kanban-board">
        <div class="column" *ngFor="let status of ['Nouveau', 'En cours', 'En attente', 'Terminé']">
          <div class="column-header" [ngClass]="status.toLowerCase().replace(' ', '-')">
            {{ status }} <span class="count">{{ getFilteredTasks(status).length }}</span>
          </div>
          
          <div class="task-list">
            <div *ngFor="let t of getFilteredTasks(status)" class="task-card" [ngClass]="'border-' + t.priority">
              <div class="task-header">
                <span class="badge" [ngClass]="t.priorite">{{ t.priorite }}</span>
                <span class="task-id">#{{ t.id_task || t.id }}</span>
                </div>
                <h4>{{ t.titre }}</h4>
                <p class="desc">{{ t.description }}</p>

              <div class="assign-section">
                <select [ngModel]="String(t.id_user_assigne)" (change)="assignMember(t, $event)" [disabled]="!(isAdmin || isProjectCreator)">
                  <option value="0">👤 Assigner à...</option>
                  <option *ngFor="let m of projectMembers" [value]="String(m.id_user)">
                    {{ m.nom }}
                  </option>
                </select>
              </div>

              <div class="task-actions">
  <button *ngIf="t.etat === 'Nouveau'" 
          (click)="confirmStatusChange(t, 'En cours')" 
          [disabled]="!canEditStatus(t)"
          class="btn-action start">Démarrer</button>
  
  <ng-container *ngIf="t.etat === 'En cours'">
    <button (click)="confirmStatusChange(t, 'En attente')" 
            [disabled]="!canEditStatus(t)"
            class="btn-action wait">Attendre</button>
    <button (click)="finishTask(t)" 
            [disabled]="!canEditStatus(t)"
            class="btn-action done">Terminer</button>
  </ng-container>

  <button *ngIf="t.etat === 'En attente'" 
          (click)="confirmStatusChange(t, 'En cours')" 
          [disabled]="!canEditStatus(t)"
          class="btn-action resume">Reprendre</button>
  
  <button *ngIf="t.etat === 'Terminé' && (isAdmin || isProjectCreator)" 
          (click)="confirmStatusChange(t, 'En cours')" 
          class="btn-action reopen">Réouvrir</button>
</div>

              <div class="comments-section">
                <div class="comment-list">
                  <div *ngFor="let c of t.comments" class="comment-item">
                    <div class="comment-bubble">
                      <strong>{{ c.user?.nom }}</strong> {{ c.contenu || c.content }}
                    </div>
                    <span class="comment-meta">{{ formatTimeAgo(c.created_at) }}</span>
                  </div>
                </div>
                <div class="comment-input">
                  <input type="text" [(ngModel)]="t.newCommentText" placeholder="Commenter..." (keyup.enter)="addComment(t)">
                  <button (click)="addComment(t)">📩</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <section class="project-comments-section">
  <h3>💬 Discussion Générale du Projet</h3>
  
  <div class="project-comment-container">
    <div class="project-comment-list">
      <div *ngFor="let comment of projectComments" class="project-comment-item">
        
        <div class="comment-avatar">
          {{ comment.user_nom?.charAt(0) || '?' }}
        </div>

        <div class="comment-content">
          <div class="comment-header">
            <strong>{{ comment.user_nom }}</strong>
            
            <small>{{ comment.created_at | date:'short' }}</small>
          </div>
          
          <p>{{ comment.contenu }}</p>
        </div>
      </div>

      <div *ngIf="projectComments.length === 0" class="no-comments">
        Aucun message pour le moment. Lancez la discussion !
      </div>
    </div>

    <div class="project-comment-input">
      <input type="text" 
             [(ngModel)]="newProjectComment" 
             placeholder="Écrivez un message au groupe..." 
             (keyup.enter)="addProjectComment()">
      
      <button (click)="addProjectComment()" [disabled]="!newProjectComment?.trim()">
        Envoyer
      </button>
    </div>
  </div>
</section>

  <section class="admin-section" *ngIf="isAdmin || isProjectCreator">
    <h2>👥 Équipe assignée</h2>
    <table class="user-table">
      <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Action</th></tr></thead>
      <tbody>
        <tr *ngFor="let user of projectMembers">
          <td>{{ user.nom }}</td>
          <td>{{ user.email }}</td>
          <td><span class="role-badge">{{ user.pivot?.role_projet || 'Collaborateur' }}</span></td> 
          <td><button (click)="deleteUser(user.id_user)" class="btn-delete">Retirer</button></td>
        </tr>
      </tbody>
    </table>
  </section>
</main>
  `,
  styles: [`
    /* --- Exact Color Palette from Screenshots --- */
    :host { 
      --primary: #1a237e;    /* Deep Navy Blue */
      --secondary: #3f51b5;  /* Soft Blue */
      --success: #004d40;    /* Dark Forest Green */
      --warning: #fb8c00;    /* Vibrant Orange */
      --danger: #d32f2f;     /* Standard Danger Red */
    }

    /* --- Global Animations --- */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .container { 
      max-width: 1400px; margin: 0 auto; padding: 0 20px; 
      animation: fadeInUp 0.8s cubic-bezier(0.2, 1, 0.2, 1); 
    }

    /* --- Header matching Screenshot #1 Gradient --- */
    .header-banner { 
      background: linear-gradient(135deg, #004d40 0%, #1a237e 100%); 
      color: white; padding: 20px 0; 
      /* ULTRA DARK HEADER DEPTH */
      box-shadow: 0 25px 60px #000000, 0 10px 20px rgba(0,0,0,0.7); 
      position: relative;
      z-index: 10;
    }

    .flex-header { display: flex; justify-content: space-between; align-items: center; }

    .search-input { 
      padding: 8px 15px; border-radius: 20px; border: 1px solid #ddd; 
      width: 250px; box-shadow: inset 0 6px 12px rgba(0,0,0,0.3);
    }

    .supervision-dashboard { 
      background: #f0f2f5; border: 1px solid #dcdfe3; border-radius: 12px; 
      padding: 20px; margin-bottom: 25px; 
      /* MAXIMUM PITCH BLACK DEPTH */
      box-shadow: 0 50px 100px #000000, 0 15px 35px rgba(0,0,0,0.5);
    }

    .supervision-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    .super-card { 
      background: white; padding: 15px; border-radius: 8px; 
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); 
    }

    .workload-info { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 5px; }

    .workload-bar { background: #eee; height: 8px; border-radius: 4px; overflow: hidden; box-shadow: inset 0 3px 6px rgba(0,0,0,0.3); }

    .workload-fill { background: var(--secondary); height: 100%; transition: width 0.3s; }

    .progress-section { 
      background: white; padding: 20px; border-radius: 10px; margin-bottom: 25px; 
      box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
    }

    .progress-bar-container { background: #eee; height: 10px; border-radius: 5px; overflow: hidden; box-shadow: inset 0 5px 10px rgba(0,0,0,0.4); }

    .progress-fill { background: #43a047; height: 100%; transition: width 0.5s; }

    .grid-layout { display: grid; grid-template-columns: 300px 1fr; gap: 25px; }

    /* --- Creation Box matching Screenshot #1 border style --- */
    .creation-box { 
      background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; 
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3); border: 2px dashed #94a3b8;
    }

    .vertical-form { display: flex; flex-direction: column; gap: 10px; }

    .vertical-form input, .vertical-form textarea, .vertical-form select { 
      padding: 8px; border: 1px solid #ddd; border-radius: 4px; 
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .kanban-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }

    .column { background: #ebedf0; border-radius: 8px; padding: 10px; min-height: 600px; box-shadow: inset 0 4px 15px rgba(0,0,0,0.2); }

    .column-header { 
      padding: 10px; color: white; border-radius: 5px; text-align: center; 
      margin-bottom: 15px; font-weight: bold; 
      box-shadow: 0 15px 30px #000000;
    }

    /* --- Kanban Column Colors from Screenshot #2 --- */
    .nouveau { background: #5c6bc0; } 
    .en-cours { background: #ffa000; } 
    .en-attente { background: #8e24aa; } 
    .termine, .terminé { background: #2e7d32; }
    
    .resume { background: #7b1fa2 !important; color: white; }
    .reopen { background: #0288d1 !important; color: white; }

    .btn-action:hover { filter: brightness(1.1); box-shadow: 0 15px 35px #000000; transform: translateY(-4px); }

    /* --- Task Card Depth (Extreme Dark) --- */
    .task-card { 
      background: white; padding: 15px; border-radius: 8px; margin-bottom: 12px; border-left: 5px solid #ccc; 
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3); 
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    .task-card:hover { transform: translateY(-10px); box-shadow: 0 60px 100px #000000; }

    .border-Haute { border-left-color: var(--danger); } 
    .border-Moyenne { border-left-color: var(--warning); } 
    .border-Basse { border-left-color: var(--success); }

    .badge { font-size: 0.7rem; padding: 2px 6px; border-radius: 3px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }

    .task-actions { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }

    .btn-action { 
      border: none; padding: 6px 10px; border-radius: 4px; color: white; cursor: pointer; 
      font-size: 0.8rem; flex: 1; font-weight: bold; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
    }

    .btn-action:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

    .start { background: var(--secondary); } 
    .done { background: var(--success); } 
    .wait { background: var(--warning); }

    .comments-section { margin-top: 10px; padding-top: 10px; border-top: 1px dotted #ccc; }

    .comment-item { margin-bottom: 8px; display: flex; flex-direction: column; }

    .comment-bubble { background: #f0f2f5; padding: 6px 10px; border-radius: 12px; font-size: 0.85rem; box-shadow: 0 6px 12px rgba(0,0,0,0.15); }

    .comment-meta { font-size: 0.7rem; color: #65676b; margin-left: 8px; margin-top: 2px; }

    .comment-input { display: flex; gap: 5px; margin-top: 8px; }

    .comment-input input { flex: 1; border-radius: 15px; border: 1px solid #ddd; padding: 4px 12px; font-size: 0.8rem; box-shadow: inset 0 3px 6px rgba(0,0,0,0.2); }

    .comment-input button { background: none; border: none; cursor: pointer; font-size: 1.1rem; filter: drop-shadow(0 6px 6px #000000); }

    .user-table { 
      width: 100%; border-collapse: collapse; background: white; border-radius: 10px; 
      overflow: hidden; box-shadow: 0 40px 90px #000000; 
    }

    .user-table th, .user-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }

    .role-badge { background: #e8eaf6; color: var(--primary); padding: 3px 10px; border-radius: 10px; font-size: 0.8rem; box-shadow: 0 3px 6px rgba(0,0,0,0.2); }

    .btn-action reopen{ background: #0f5e9e; color: white; cursor: pointer; opacity: 1; }

    .btn-delete { background: none; border: 1px solid var(--danger); color: var(--danger); border-radius: 4px; cursor: pointer; transition: 0.2s; }
    .btn-delete:hover { background: var(--danger); color: white; box-shadow: 0 10px 25px rgba(211, 47, 47, 0.6); }

    h4 { color: #000000 !important; font-weight: bold !important; display: block !important; min-height: 20px; }

    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 1000; }

    .toast { padding: 15px 25px; border-radius: 8px; color: white; margin-bottom: 10px; box-shadow: 0 30px 60px #000000; font-weight: bold; }

    .toast.success { background: var(--success); } 
    .toast.error { background: var(--danger); }

    .project-comment-list { 
      max-height: 300px; overflow-y: auto; background: #f8f9fa; padding: 15px; 
      border-radius: 8px; margin-bottom: 10px; box-shadow: inset 0 8px 20px rgba(0, 0, 0, 0.3); 
    }

    .project-comment-item { display: flex; gap: 12px; margin-bottom: 15px; }

    .comment-avatar { width: 35px; height: 35px; background: #007bff; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 12px rgba(0,0,0,0.4); }

    .comment-content p { background: white; padding: 8px 12px; border-radius: 0 10px 10px 10px; margin: 4px 0; border: 1px solid #eee; box-shadow: 0 8px 15px rgba(0,0,0,0.15); }

    .project-comment-input { display: flex; gap: 10px; }

    .project-comment-input input { flex: 1; padding: 8px 15px; border-radius: 20px; border: 1px solid #ddd; box-shadow: inset 0 3px 6px rgba(0,0,0,0.2); }

    .project-comment-input button { 
      padding: 8px 20px; border-radius: 20px; background: var(--primary); color: white; 
      border: none; cursor: pointer; box-shadow: 0 15px 30px #000000; 
    }

    .project-comment-input button:disabled { background: #ccc; box-shadow: none; }
  `]
})
export class ProjectDetailComponent implements OnInit, OnDestroy {

public countBlocked: number = 0;
public countUnassigned: number = 0;

  public String = String;
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  public notifService = inject(NotificationService);
  private projectService = inject(ProjectService);
  private refreshSubscription?: Subscription;

  public isAdmin: boolean = false;
  public isProjectCreator: boolean = false;
  projectId!: number;
  tasks: any[] = [];
  projectMembers: any[] = [];
  allUsers: any[] = [];
  searchQuery: string = '';
  newTask = { titre: '', description: '', priorite: 'Moyenne', etat: 'Nouveau' };
  newMember = { id_user: 0, role_projet: 'Développeur' };

  projectComments: any[] = [];
  newProjectComment: string = "";

  public projectLogs: any[] = [];

  ngOnInit() {
    this.checkAdminStatus();
    const idFromUrl = this.route.snapshot.paramMap.get('id');
    if (idFromUrl) {
      this.projectId = Number(idFromUrl);
      this.loadProjectData();
      this.loadLogs(); 
    }
    this.refreshSubscription = interval(5000).subscribe(() => {
      if (this.projectId) {
        this.silentLoadTasks();
        this.loadLogs(); 
      }
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
  }

  loadLogs() {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
  
  this.http.get<any[]>(`http://localhost:3000/api/projects/${this.projectId}/logs`, { headers }).subscribe({
    next: (data: any) => {
      // ON AJOUTE CETTE CONDITION : 
      // Si le serveur renvoie des logs, on les affiche. 
      // S'il renvoie vide, on ne touche à rien pour garder nos logs locaux.
      if (data && data.length > 0) {
        this.projectLogs = data.map((log: any) => ({
    time: log.created_at,
    user: log.user_nom || (log.user ? log.user.nom : 'Utilisateur'),
    action: log.action,
    // On s'assure de récupérer la valeur depuis 'description' qui vient de la DB
    target: log.description || log.target || 'Tâche' 
}));
      }
    },
    error: (err) => console.error("Erreur lors de la récupération des logs", err)
  });
}

  private addToLogs(action: string, target: string) {
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roleTag = (this.isAdmin || this.isProjectCreator) ? '⭐ ' : '';
    this.projectLogs.unshift({
      time: new Date(),
      user: roleTag + (user.nom || 'Utilisateur'),
      action: action,
      target: target
    });
    if (this.projectLogs.length > 15) this.projectLogs.pop();
  }

  canEditStatus(task: any): boolean {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = Number(user.id_user);
  const assignedUserId = Number(task.id_user_assigne);

  if (this.isAdmin || this.isProjectCreator) {
    return true;
  }
  return currentUserId === assignedUserId;
}

  formatTimeAgo(dateString: string): string {
    if (!dateString) return "à l'instant";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (isNaN(seconds)) return "date invalide";
    if (seconds < 60) return `il y a ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return date.toLocaleDateString();
  }

  private extractMembersArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.users && Array.isArray(res.users)) return res.users;
    if (res?.members && Array.isArray(res.members)) return res.members;
    const firstKey = Object.keys(res || {}).find(k => Array.isArray(res[k]));
    return firstKey ? res[firstKey] : [];
  }
  

  loadProjectData() {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.isProjectCreator = (Number(user.id_user) === Number(project.id_user_createur));

        this.projectService.getProjectMembers(this.projectId).subscribe(res => {
          this.projectMembers = this.extractMembersArray(res);
          const isMember = this.projectMembers.some((m: any) => Number(m.id_user) === Number(user.id_user));

          if (this.isAdmin || this.isProjectCreator || isMember) {
            this.loadTasks();
            this.projectService.getProjectComments(this.projectId).subscribe(res => {
              this.projectComments = res;
            });
            if (this.isAdmin || this.isProjectCreator) this.loadAllUsers();
          } else {
            this.notifService.show("🚫 Accès refusé : Vous ne faites pas partie de ce projet", "error");
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }

  addProjectComment() {
    if (!this.newProjectComment.trim()) return;
    const commentData = {
      id_project: this.projectId,
      contenu: this.newProjectComment
    };
    this.projectService.postProjectComment(commentData).subscribe({
      next: (res) => {
        this.projectComments.push(res);
        this.addToLogs('a posté un message général', 'Discussion');
        this.newProjectComment = "";
        this.notifService.show("Message envoyé", "success");
        this.loadLogs(); // FIX
      },
      error: () => this.notifService.show("Erreur d'envoi", "error")
    });
  }

  getUserTaskCount(userId: number): number { return this.tasks.filter(t => Number(t.id_user_assigne) === userId).length; }
  getUserWorkload(userId: number): number { return this.tasks.length === 0 ? 0 : (this.getUserTaskCount(userId) / this.tasks.length) * 100; }

  confirmStatusChange(task: any, newStatus: string) {
    if ((task.etat || '').toLowerCase() === 'nouveau' && newStatus.toLowerCase().includes('termin')) {
      this.notifService.show("🚫 Passage direct interdit : La tâche doit être 'En cours'", "error");
      return;
    }
    this.taskService.updateStatus(task.id_task || task.id, newStatus).subscribe(() => {
      this.addToLogs(`a changé le statut en ${newStatus}`, task.title || task.titre || 'Tâche');
      this.notifService.show(`🚀 Statut mis à jour : ${newStatus}`);
      this.loadTasks();
      this.loadLogs(); 
    });
  }

  finishTask(task: any) { this.confirmStatusChange(task, 'Terminé'); }

  addTask() {
    if (!this.newTask.titre) return;
    this.taskService.createTask({ ...this.newTask, id_project: this.projectId }).subscribe(() => {
      this.notifService.show("📢 Tâche créée");
      this.newTask = { titre: '', description: '', priorite: 'Moyenne', etat: 'Nouveau' };
      this.loadTasks();
      this.loadLogs(); 
    });
  }

  addMemberToProject() {
    this.projectService.addMember(this.projectId, this.newMember).subscribe(() => {
      this.notifService.show("👥 Membre ajouté");
      this.loadMembers();
      this.loadLogs(); 
    });
  }

  addComment(task: any) {
    if (!task.newCommentText?.trim()) return;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.post(`http://localhost:3000/api/tasks/${task.id_task || task.id}/comment`, { contenu: task.newCommentText }, { headers }).subscribe(() => {
      this.addToLogs('a commenté la tâche', task.title || task.titre);
      task.newCommentText = '';
      this.silentLoadTasks();
      this.loadLogs(); 
    });
  }

  loadTasks() { 
    this.taskService.getTasksByProject(this.projectId).subscribe(d => {
      this.tasks = d.map(t => ({...t, newCommentText: ''}));
      this.refreshSupervision();
    }); 
  }

  silentLoadTasks() {
    this.taskService.getTasksByProject(this.projectId).subscribe(data => {
      if (data) {
        this.tasks = data.map(nT => {
          const oT = this.tasks.find(t => (t.id_task || t.id) === (nT.id_task || nT.id));
          return { ...nT, newCommentText: oT?.newCommentText || '' };
        });
        this.refreshSupervision();
      }
    });
  }

  refreshSupervision() {
    if (!this.tasks) return;
    this.countBlocked = this.tasks.filter(t => {
      const s = (t.etat || '').toLowerCase();
      return s.includes('attente') || s.includes('bloqu');
    }).length;
    this.countUnassigned = this.tasks.filter(t => !t.id_user_assigne || t.id_user_assigne == 0 || t.id_user_assigne == "0").length;
  }

  getFilteredTasks(status: string) {
    return this.tasks.filter(t => {
      const s = (t.etat || '').toLowerCase().trim();
      const target = status.toLowerCase().trim();
      const match = (target === 'termine' || target === 'terminé') ? s.includes('termin') : s === target;
      return match && (t.title || t.titre)?.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }

  getCompletionRate() { 
    if (!this.tasks.length) return 0;
    const done = this.tasks.filter(t => (t.etat || '').toLowerCase().includes('termin')).length;
    return Math.round((done / this.tasks.length) * 100);
  }

  assignMember(task: any, ev: any) {
    this.taskService.assignTask(task.id_task || task.id, ev.target.value).subscribe(() => {
      this.notifService.show("👤 Assignation mise à jour");
      this.loadLogs(); 
    });
  }

  loadMembers() { this.projectService.getProjectMembers(this.projectId).subscribe(res => this.projectMembers = this.extractMembersArray(res)); }
  loadAllUsers() { 
    const h = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.get<any[]>('http://localhost:3000/api/users', { headers: h }).subscribe(d => this.allUsers = d); 
  }

  checkAdminStatus() { 
    const u = JSON.parse(localStorage.getItem('user') || '{}'); 
    this.isAdmin = u.role === 'Admin' || u.is_admin === 1; 
  }

  deleteUser(uid: number) {
    if (!confirm("Retirer ce membre ?")) return;
    const h = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.delete(`http://localhost:3000/api/projects/${this.projectId}/members/${uid}`, { headers: h }).subscribe(() => {
        this.loadMembers();
        this.loadLogs(); 
    });
  }

  deleteProject() {
    if (confirm("⚠️ Êtes-vous sûr de vouloir supprimer ce projet et toutes ses tâches ?")) {
      this.projectService.deleteProject(this.projectId).subscribe({
        next: () => {
          this.notifService.show("Projet supprimé définitivement", "success");
          this.router.navigate(['/dashboard']);
        },
        error: () => this.notifService.show("Erreur lors de la suppression du projet", "error")
      });
    }
  }

  goBack() { this.router.navigate(['/dashboard']); }
}