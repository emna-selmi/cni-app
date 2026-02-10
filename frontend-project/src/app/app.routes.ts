import { Routes } from '@angular/router';
import { TaskManagementComponent } from './components/task-management/task-management.component'; 
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ProjectCreateComponent } from './components/projects/project-create.component';
import { UserManagementComponent } from './components/users/user-management.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';

export const routes: Routes = [
  // --- ROUTES PUBLIQUES ---
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // --- ROUTES PRIVÉES (GESTION PROJET) ---
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projects/new', component: ProjectCreateComponent },
  { path: 'project/:id', component: ProjectDetailComponent }, 
  { path: 'tasks', component: TaskManagementComponent },
  
  // Ta route de secours pour éviter les crashs
  { path: 'notifications', component: DashboardComponent }, 

  // --- ROUTES ADMINISTRATION ---
  { path: 'admin/users', component: UserManagementComponent },

  // --- REDIRECTIONS & ERREURS ---
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: '**', redirectTo: 'register' } 
];
