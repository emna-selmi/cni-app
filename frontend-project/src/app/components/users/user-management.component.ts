import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-header">
      <div class="container flex-header">
        <h1>⚙️ Administration des Utilisateurs</h1>
        <button (click)="goBack()" class="btn-back">⬅️ Retour Dashboard</button>
      </div>
    </div>

    <div class="container main-content">
      <div class="user-card">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">Liste des comptes</h2>
          <button class="btn-add" (click)="showForm = !showForm">
            {{ showForm ? '✖️ Annuler' : '➕ Ajouter Utilisateur' }}
          </button>
        </div>

        <div *ngIf="showForm" class="add-user-form">
          <h3>Créer un nouvel utilisateur</h3>
          <form #userForm="ngForm" (ngSubmit)="userForm.form.valid && submitUser()">
            <div class="form-grid">
              
              <div class="input-group">
                <input type="text" [(ngModel)]="newUser.nom" name="nom" #nom="ngModel" placeholder="Nom complet" required>
                <small class="error" *ngIf="nom.invalid && nom.touched">Le nom est requis</small>
              </div>

              <div class="input-group">
                <input type="email" [(ngModel)]="newUser.email" name="email" #email="ngModel" placeholder="Email (ex: test@cni.tn)" required email>
                <small class="error" *ngIf="email.invalid && email.touched">Format email invalide</small>
              </div>

              <div class="input-group">
                <input type="password" [(ngModel)]="newUser.password" name="password" #pass="ngModel" placeholder="Mot de passe" required minlength="6">
                <small class="error" *ngIf="pass.invalid && pass.touched">6 caractères minimum (Sécurité 7.1)</small>
              </div>

              <select [(ngModel)]="newUser.role" name="role">
                <option value="Utilisateur">Utilisateur</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            <button type="submit" class="btn-submit" [disabled]="userForm.form.invalid" [style.opacity]="userForm.form.invalid ? '0.5' : '1'">
              Enregistrer l'utilisateur
            </button>
          </form>
        </div>

        <table *ngIf="users.length > 0; else loading">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle Global</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.nom }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select [(ngModel)]="user.role" (change)="updateUserRole(user)" 
                        class="role-badge-select" 
                        [class.admin-text]="user.role.toLowerCase() === 'admin'">
                  <option value="Utilisateur">Utilisateur</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td style="text-align: center;">
                <div class="action-buttons">
                  <button (click)="resetPassword(user)" class="btn-reset">🔑 Reset</button>
                  
                  <button 
                    *ngIf="user.email !== 'admin@test.com'" 
                    (click)="deleteUser(user.id_user || user.id)" 
                    class="btn-delete">
                    Supprimer
                  </button>
                  
                  <span *ngIf="user.email === 'admin@test.com'" class="current-label">
                    Compte Actuel
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <ng-template #loading>
          <div class="empty-state">Chargement des utilisateurs ou liste vide...</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    /* --- Added Entry Animation --- */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .container { 
      max-width: 1100px; margin: 0 auto; padding: 20px; 
      animation: fadeInUp 0.7s cubic-bezier(0.2, 1, 0.2, 1);
    }

    /* Admin Header: Deep Gradient + Heavy Black Shadow */
    .admin-header { 
      background: linear-gradient(135deg, #004d40 0%, #1a237e 100%); 
      color: white; padding: 20px 0; margin-bottom: 30px; 
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7); /* DARKEST SHADOW */
      position: relative; z-index: 10;
    }

    .flex-header { display: flex; justify-content: space-between; align-items: center; }

    /* User Card: Added Elevation */
    .user-card { 
      background: white; border-radius: 16px; 
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); /* HEAVY SHADOW */
      padding: 25px; 
      border: 1px solid rgba(0,0,0,0.05);
    }
    
    /* Form: Inset Depth + Radius */
    .add-user-form { 
      background: #f8f9fa; padding: 25px; border-radius: 15px; 
      border: 2px dashed #94a3b8; margin-bottom: 30px; 
      box-shadow: inset 0 5px 15px rgba(0,0,0,0.25); /* STARK INSET */
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
    .input-group { display: flex; flex-direction: column; }
    .error { color: #dc3545; font-size: 0.75rem; margin-top: 2px; font-weight: 700; }
    
    input.ng-invalid.ng-touched { 
      border-color: #dc3545; background-color: #fff8f8; 
      box-shadow: 0 0 10px rgba(220, 53, 69, 0.3); 
    }

    input, select { 
      padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; 
      box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: all 0.2s;
    }
    input:focus, select:focus { 
      outline: none; border-color: #1a237e; box-shadow: 0 5px 15px rgba(0,0,0,0.2); 
    }

    /* Buttons: Tactile Depth */
    .btn-submit { 
      background: linear-gradient(135deg, #1a237e 0%, #004d40 100%); 
      color: white; border: none; padding: 12px 20px; border-radius: 8px; 
      cursor: pointer; width: 100%; font-weight: 800; 
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5); /* DARK SHADOW */
      transition: all 0.3s;
    }
    .btn-submit:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.65); }
    .btn-submit:active { transform: translateY(2px); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); }
    
    /* Table: Modern Layout */
    table { 
      width: 100%; border-collapse: separate; border-spacing: 0 8px; margin-top: 10px; 
    }
    th, td { padding: 14px; text-align: left; }
    th { background: #f1f5f9; font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    td { background: #ffffff; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
    td:first-child { border-left: 1px solid #eee; border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
    td:last-child { border-right: 1px solid #eee; border-top-right-radius: 10px; border-bottom-right-radius: 10px; }
    
    /* Badges & Actions */
    .role-badge-select { 
      padding: 6px 12px; border-radius: 20px; border: 1px solid #cbd5e1; 
      font-size: 0.85rem; cursor: pointer; font-weight: bold;
      box-shadow: 0 3px 6px rgba(0,0,0,0.15);
    }
    .admin-text { background: #fff3cd !important; color: #856404 !important; border-color: #ffeeba !important; }
    
    .action-buttons { display: flex; gap: 10px; justify-content: center; }
    
    .btn-reset { 
      background: #ffc107; color: #000; border: none; padding: 8px 12px; 
      border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }
    .btn-delete { 
      background: #dc3545; color: white; border: none; padding: 8px 14px; 
      border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    }
    .btn-add { 
      background: #28a745; color: white; border: none; padding: 10px 18px; 
      border-radius: 8px; cursor: pointer; font-weight: 800;
      box-shadow: 0 8px 15px rgba(0,0,0,0.4);
    }
    .btn-back { 
      background: #6c757d; color: white; border: none; padding: 10px 18px; 
      border-radius: 8px; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    
    .current-label { color: #64748b; font-size: 0.8em; font-style: italic; align-self: center; font-weight: 600; }
    .empty-state { text-align: center; padding: 50px; color: #94a3b8; font-weight: bold; font-size: 1.1rem; }
  `]
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  
  users: any[] = [];
  showForm = false;
  
  newUser = { nom: '', email: '', password: '', role: 'Utilisateur' };

  ngOnInit() { this.loadUsers(); }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:3000/api/users', { headers: this.getHeaders() }).subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error("Erreur API :", err)
    });
  }

  submitUser() {
    this.http.post('http://localhost:3000/api/users', this.newUser, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("✅ Utilisateur créé avec succès !");
        this.showForm = false;
        this.newUser = { nom: '', email: '', password: '', role: 'Utilisateur' };
        this.loadUsers();
      },
      error: (err) => alert("❌ Erreur : " + (err.error.errors?.email ? "Cet email est déjà utilisé." : "Impossible de créer l'utilisateur"))
    });
  }

  updateUserRole(user: any) {
    const id = user.id_user || user.id;
    this.http.put(`http://localhost:3000/api/users/${id}`, { role: user.role }, { headers: this.getHeaders() }).subscribe({
      next: () => console.log("Rôle mis à jour"),
      error: () => alert("Erreur lors de la mise à jour du rôle")
    });
  }

  resetPassword(user: any) {
    const newPass = prompt(`Entrez le nouveau mot de passe pour ${user.nom} (min 6 car.) :`);
    if (!newPass || newPass.length < 6) {
      if(newPass) alert("Sécurité : 6 caractères minimum requis.");
      return;
    }
    const id = user.id_user || user.id;
    this.http.put(`http://localhost:3000/api/users/${id}`, { password: newPass }, { headers: this.getHeaders() }).subscribe({
      next: () => alert("✅ Mot de passe réinitialisé !"),
      error: () => alert("❌ Erreur de réinitialisation")
    });
  }

  deleteUser(id: number) {
    if (!id || !confirm("🚨 Supprimer définitivement cet utilisateur ?")) return;
    this.http.delete(`http://localhost:3000/api/users/${id}`, { headers: this.getHeaders() }).subscribe({
      next: () => { this.loadUsers(); alert("Utilisateur supprimé."); },
      error: (err) => alert("Erreur de suppression")
    });
  }

  goBack() { window.history.back(); }
}