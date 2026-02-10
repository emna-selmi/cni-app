import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <div class="bg-blobs">
        <div class="blob" style="top: -10%; left: -10%;"></div>
        <div class="blob" style="bottom: -10%; right: -10%; background: radial-gradient(circle, rgba(76, 201, 240, 0.15) 0%, transparent 70%);"></div>
      </div>

      <div class="auth-card glass-card anim-fade-in">
        <div class="logo-area">
          <div class="cni-logo">CNI</div>
          <p class="tagline">Centre National de l'Informatique</p>
        </div>
        
        <h2>Bienvenue</h2>
        <p class="desc">Connectez-vous pour gérer vos projets</p>
        
        <form (ngSubmit)="onLogin()">
          <div class="input-group">
            <label>Email professionnel</label>
            <input type="email" [(ngModel)]="creds.email" name="email" placeholder="admin@cni.tn" required>
          </div>

          <div class="input-group">
            <label>Mot de passe</label>
            <input type="password" [(ngModel)]="creds.password" name="password" placeholder="••••••••" required>
          </div>

          <button type="submit" class="btn-modern">Se connecter</button>
          
          <div *ngIf="errorMessage" class="error-badge">{{ errorMessage }}</div>
        </form>

        <div class="auth-footer">
          <span>Nouveau ici ?</span> <a routerLink="/register">Créer un compte</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Les styles sont identiques à Register pour garder une cohérence parfaite */
    .auth-wrapper { height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card { width: 100%; max-width: 420px; padding: 40px; text-align: center; }
    .cni-logo { font-size: 2.5rem; font-weight: 900; background: linear-gradient(135deg, #1a237e, #4361ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .tagline { font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b; margin-bottom: 25px; }
    h2 { font-size: 1.6rem; color: #1e293b; margin-bottom: 5px; }
    .desc { color: #64748b; font-size: 0.9rem; margin-bottom: 25px; }
    .input-group { text-align: left; margin-bottom: 18px; }
    label { display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; color: #475569; }
    input { width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: rgba(255,255,255,0.5); transition: 0.3s; box-sizing: border-box; }
    input:focus { outline: none; border-color: #4361ee; background: white; box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1); }
    .btn-modern { width: 100%; padding: 14px; margin-top: 10px; border: none; border-radius: 10px; background: linear-gradient(135deg, #4361ee, #4cc9f0); color: white; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3); }
    .error-badge { margin-top: 15px; padding: 10px; background: #fee2e2; color: #b91c1c; border-radius: 8px; font-size: 0.8rem; }
    .auth-footer { margin-top: 20px; font-size: 0.85rem; color: #64748b; }
    a { color: #4361ee; font-weight: 700; text-decoration: none; margin-left: 5px; }
    .anim-fade-in { animation: fadeInUp 0.6s ease-out; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
  creds = { email: '', password: '' };
  errorMessage = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  onLogin() {
    this.errorMessage = ''; 
    this.auth.login(this.creds).subscribe({
      next: (response: any) => {
        // --- LES AJOUTS SONT ICI ---
        
        // 1. On stocke le TOKEN (clé d'accès à l'API)
        localStorage.setItem('token', response.access_token || response.token);
        
        // 2. On stocke l'objet USER complet (Nom, Email, Rôle)
        // C'est indispensable pour que isAdmin() fonctionne dans le Dashboard
        localStorage.setItem('user', JSON.stringify(response.user));

        // 3. Redirection vers le tableau de bord
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erreur login:', err);
        this.errorMessage = 'Email ou mot de passe incorrect.';
      }
    });
  }
}