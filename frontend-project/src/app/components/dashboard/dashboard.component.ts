import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project';
import { TaskService } from '../../services/task';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth'; // Ensure this import is correct for your path
import { interval, Subscription, switchMap, forkJoin } from 'rxjs';
import { ChatBotComponent } from '../chat-bot/chat-bot';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ChatBotComponent],
  template: `
    <div class="header-banner">
  <div class="container flex-header">
    <h1>Tableau de Bord - Gestion CNI</h1>
    
    <div class="header-actions">
      <div class="notif-container">
  <button class="btn-notif" (click)="showMenu = !showMenu">
    🔔 
    <span class="badge" *ngIf="unreadCount() > 0">
      {{ unreadCount() }}
    </span>
  </button>

  <div class="notif-dropdown" *ngIf="showMenu">
    <h4>Activités Récentes</h4>
    <div class="notif-list" style="max-height: 350px; overflow-y: auto;">
      
      <div *ngFor="let n of notifications()" 
           class="notif-item" 
           (click)="notifService.goToNotification(n)"
           [style.background-color]="n.is_read === 0 ? '#f0f7ff' : 'transparent'"
           style="padding: 12px; border-bottom: 1px solid #eee; position: relative; cursor: pointer;">
        
        <strong style="display: block; font-size: 0.95em; color: #1a237e;">
          {{ n.title || 'Notification' }}
        </strong>
        
        <p style="margin: 4px 0; font-size: 0.85em; color: #444;">
          {{ n.message || n.contenu }}
        </p>
        
        <small style="color: #999; font-size: 0.75em;">
          {{ n.created_at | date:'short' }}
        </small>

        <span *ngIf="n.is_read === 0" 
              style="position: absolute; right: 10px; top: 15px; width: 8px; height: 8px; background: #2196f3; border-radius: 50%;">
        </span>
      </div>

      <div *ngIf="notifications().length === 0" class="empty-notif" style="padding: 20px; text-align: center; color: #888;">
        Aucune activité pour le moment.
      </div>
    </div>
    <button class="btn-all" (click)="goToNotifications()">Voir tout l'historique</button>
  </div>
</div>

      <button *ngIf="isAdmin()" (click)="goToAdmin()" class="btn-admin">⚙️ Gérer Utilisateurs</button>
      <button (click)="logout()" class="btn-logout">Déconnexion</button>
    </div>
  </div>
</div>

<div class="container main-content">
  <div class="dashboard-stats">
    <h3>📊 Statistiques Globales <small style="font-size: 0.5em; color: #4caf50;">● Temps Réel</small></h3>
    <div class="global-stats-grid">
      <div class="stat-card blue">
        <h3>{{ projectService.projects().length }}</h3>
        <p>Total Projets</p>
      </div>
      <div class="stat-card green">
        <h3>{{ completedProjectsCount() }}</h3>
        <p>Terminés</p>
      </div>
      <div class="stat-card orange">
        <h3>{{ globalProgress() }}%</h3>
        <p>Avancement Global</p>
      </div>
    </div>
  </div>

  <div class="creation-box">
    <h3>+ Nouveau Projet</h3>
    <form #pForm="ngForm" (ngSubmit)="pForm.form.valid && createProject()" class="inline-form">
      <input type="text" [(ngModel)]="newProject.nom_projet" name="nom" placeholder="Nom du projet" required>
      <input type="text" [(ngModel)]="newProject.description" name="desc" placeholder="Description">
      <input type="date" [(ngModel)]="newProject.date_fin" name="date" required>
      <button type="submit" [disabled]="pForm.form.invalid" class="btn-primary">
        Enregistrer
      </button>
    </form>
  </div>

  <div class="filters-bar">
    <input type="text" [(ngModel)]="searchQuery" placeholder="🔍 Rechercher un projet...">
  </div>

  <div class="grid" *ngIf="filteredProjects().length > 0; else noProjects">
    <div *ngFor="let p of filteredProjects()" class="card">
      <div class="card-header">
        <h3 (click)="goToProject(p.id_project || p.id)" class="project-link">
          {{ p.nom_projet || p.nom }}
        </h3>
      </div>
      <div class="project-progress-mini">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" [style.width.%]="p.completion_rate || 0"></div>
        </div>
        <small>{{ p.completion_rate || 0 }}% terminé</small>
      </div>
      <div class="card-footer">
        <small>Échéance : {{ p.date_fin }}</small>
        <button 
        *ngIf="currentUser?.role === 'Admin' || currentUser?.id_user === p.id_user_createur"
        (click)="deleteProject(p.id_project || p.id)" class="btn-del">🗑️</button>
      </div>
    </div>
  </div>

  <ng-template #noProjects>
    <div class="empty">Aucun projet trouvé.</div>
  </ng-template>
</div>

<div class="toast-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
  <div *ngFor="let toast of notifService.toasts()" class="toast" [ngClass]="toast.type"
       style="padding: 15px; margin-bottom: 5px; border-radius: 8px; color: white; background: #333;">
    {{ toast.msg }}
  </div>
  
</div><app-chat-bot></app-chat-bot>
  `,
  styles: [`
    /* --- Global Animations --- */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse-badge {
      0% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.8); }
      70% { box-shadow: 0 0 0 15px rgba(255, 82, 82, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
    }

    /* --- Container & Layout --- */
    .container { 
      max-width: 1100px; 
      margin: 0 auto; 
      padding: 0 20px; 
      animation: fadeInUp 0.8s cubic-bezier(0.2, 1, 0.2, 1); 
    }

    /* --- Header (Pitch Dark Shadow) --- */
    .header-banner { 
      background: linear-gradient(135deg, #004d40 0%, #1a237e 100%);
      color: white; 
      padding: 18px 0; 
      /* EXTREMELY DARK HEADER SHADOW */
      box-shadow: 0 15px 45px rgba(0, 0, 0, 0.7), 0 5px 15px rgba(0, 0, 0, 0.5);
      position: relative;
      z-index: 100;
    }
    
    /* Style de la notification dans le header */
  .notif-container { position: relative; display: inline-block; }
  .btn-notif { background: none; border: none; font-size: 1.5rem; cursor: pointer; position: relative; }
  .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #df0a0a; /* Rouge vif */
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 0.7rem;
    font-weight: bold;
    border: 2px solid white; /* Pour le faire ressortir sur le fond bleu */
    min-width: 18px;
    text-align: center;
}
    .flex-header { display: flex; justify-content: space-between; align-items: center; }

    /* --- Notifications & Dropdown --- */
    .btn-notif { background: none; border: none; font-size: 1.6rem; cursor: pointer; color: white; transition: all 0.2s; }
    .btn-notif:hover { transform: translateY(-3px); filter: drop-shadow(0 8px 8px rgba(0,0,0,0.6)); }
    
    .notif-dropdown { 
      position: absolute; right: 0; top: 55px; background: white; color: #333; 
      width: 320px; border-radius: 16px;
      /* DEEP FLOATING BLACK SHADOW */
      box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6), 0 15px 30px rgba(0, 0, 0, 0.3); 
      z-index: 1000; padding: 15px; 
      border: 1px solid rgba(0,0,0,0.2);
    }

    /* --- Statistics Cards --- */
    .global-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { 
      padding: 22px; border-radius: 20px;
      color: white; text-align: center; 
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      /* BOLD BLACK DEPTH */
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
    }
    .stat-card:hover { 
      transform: translateY(-10px); 
      box-shadow: 0 25px 55px rgba(0, 0, 0, 0.7); 
    }
    
    .blue { background: linear-gradient(135deg, #3f51b5, #1a237e); } 
    .green { background: linear-gradient(135deg, #43a047, #004d40); } 
    .orange { background: linear-gradient(135deg, #fb8c00, #e65100); }

    /* --- Project Cards (Maximum Contrast Shadows) --- */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
    
    .card { 
      background: #ffffff; 
      border: 1px solid rgba(0,0,0,0.1); 
      padding: 25px; 
      border-radius: 24px;
      /* HEAVY MULTI-LAYER DARK SHADOWS */
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.35), 
        0 8px 15px rgba(0, 0, 0, 0.25),
        0 0 2px rgba(0, 0, 0, 0.5);
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    .card:hover { 
      transform: translateY(-15px); 
      /* PITCH BLACK DEPTH ON HOVER */
      box-shadow: 
        0 50px 90px -15px rgba(0, 0, 0, 0.65), 
        0 20px 35px -5px rgba(0, 0, 0, 0.4);
      border-color: #004d40;
    }

    /* --- Progress Bar --- */
    .progress-bar-bg { background: #cbd5e1; height: 12px; border-radius: 6px; box-shadow: inset 0 6px 8px rgba(0,0,0,0.3); overflow: hidden; }
    .progress-bar-fill { background: linear-gradient(90deg, #4caf50, #004d40); height: 100%; box-shadow: 0 0 15px rgba(0, 0, 0, 0.4); }

    /* --- Buttons --- */
    .btn-primary { 
      background: linear-gradient(135deg, #2e7d32 0%, #004d40 100%); 
      color: white; border: none; padding: 14px 30px; border-radius: 12px; 
      cursor: pointer; font-weight: 800;
      /* EXTRA DARK GLOW SHADOW */
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
      transition: all 0.3s;
    }
    .btn-primary:hover { 
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.75); 
    }
    .btn-primary:active { transform: translateY(3px); box-shadow: 0 5px 12px rgba(0, 0, 0, 0.5); }

    /* --- Creation Box --- */
    .creation-box { 
      background: #f1f5f9; 
      padding: 35px; 
      border-radius: 20px; 
      margin: 35px 0; 
      border: 2px dashed #94a3b8;
      /* STARK INNER DIMENSION */
      box-shadow: inset 0 8px 20px rgba(0,0,0,0.25);
    }

    .toast.success { background: #004d40; border-left: 6px solid #4caf50; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7); }
    .btn-del { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  public projectService = inject(ProjectService);
  public taskService = inject(TaskService);
  public notifService = inject(NotificationService);
  private router = inject(Router);

  // FIXED: Declared currentUser property
  currentUser: any = null;

  constructor(private authService: AuthService) {}

  private refreshSubscription?: Subscription;

  newProject = { nom_projet: '', description: '', date_fin: '' };
  searchQuery: string = '';
  showMenu = false;
  
  notifications = signal<any[]>([]);

  unreadCount = computed(() => 
    this.notifications().filter(n => n.is_read === 0 || n.is_read === false).length
  );

  completedProjectsCount = computed(() =>
    this.projectService.projects().filter(p => (Number(p.completion_rate) === 100)).length
  );

  globalProgress = computed(() => {
    const projects = this.projectService.projects();
    if (!projects.length) return 0;
    const total = projects.reduce((acc, p) => acc + (Number(p.completion_rate) || 0), 0);
    return Math.round(total / projects.length);
  });

  ngOnInit() {
    this.loadProjectsAndTasks();
    this.loadNotifs();

    // FIXED: Initialized currentUser
    this.currentUser = this.authService.getCurrentUser();

    this.refreshSubscription = interval(5000).subscribe(() => {
      this.loadNotifs();
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
  }

  loadNotifs() {
    this.notifService.getNotifications().subscribe({
      next: (data) => {
        this.notifications.set(data);
      },
      error: (err) => {
        console.error("Erreur de chargement des notifs", err);
        this.notifications.set([]);
      }
    });
  }

  loadProjectsAndTasks() {
    this.projectService.getProjects().subscribe(projects => {
      if (!projects || projects.length === 0) {
        this.projectService.projects.set([]);
        return;
      }
      const taskRequests = projects.map(p => this.taskService.getByProject(p.id_project || p.id));
      forkJoin(taskRequests).subscribe(allTasks => {
        projects.forEach((p, index) => p.tasks = allTasks[index]);
        this.projectService.projects.set(projects);
      });
    });
  }

  createProject() {
    const projectData = {
      nom_projet: this.newProject.nom_projet,
      description: this.newProject.description,
      date_fin: this.newProject.date_fin
    };

    this.projectService.createProject(projectData).subscribe({
      next: (res) => {
        console.log("Succès !", res);
        this.loadProjectsAndTasks(); // Refresh list after creation
      },
      error: (err) => {
        console.log("LE MESSAGE RÉEL :", err.error.message); 
        console.error("Erreur complète :", err);
      }
    });
  }

  deleteProject(id: any) {
    if (confirm("Supprimer ce projet ?")) {
      (this.projectService as any).deleteProject(id).subscribe(() => {
        this.notifService.show("🗑️ Projet supprimé");
        this.loadProjectsAndTasks();
      });
    }
  }

  filteredProjects() {
    return this.projectService.projects().filter(p => 
      (p.nom_projet || '').toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role?.toLowerCase() === 'admin';
  }

  goToProject(id: number) { this.router.navigate(['/project', id]); }
  goToAdmin() { this.router.navigate(['/admin/users']); }
  goToNotifications() { this.router.navigate(['/notifications']); }
  logout() { 
    localStorage.clear(); 
    window.location.href = '/login'; 
  }
}