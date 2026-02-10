import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="bg-blobs">
        <div class="blob" style="top: -5%; left: -5%;"></div>
        <div class="blob" style="bottom: -5%; right: -5%; background: radial-gradient(circle, rgba(76, 201, 240, 0.15) 0%, transparent 70%);"></div>
      </div>

      <div class="auth-card glass-card anim-fade-in">
        <div class="logo-area">
          <div class="cni-logo">CNI</div>
          <p class="tagline">Centre National de l'Informatique</p>
        </div>

        <h2>🚀 Créer un compte</h2>
        <p class="desc">Rejoignez votre équipe de gestion de projet</p>
        
        <form (ngSubmit)="onRegister()">
          <div class="input-group">
            <label>Nom complet</label>
            <input type="text" [(ngModel)]="user.nom" name="nom" placeholder="Ex: Jean Dupont" required>
          </div>

          <div class="input-group">
            <label>Email professionnel</label>
            <input type="email" [(ngModel)]="user.email" name="email" placeholder="email@cni.tn" required>
          </div>

          <div class="input-group">
            <label>Mot de passe</label>
            <input type="password" [(ngModel)]="user.password" name="password" placeholder="••••••••" required>
          </div>

          <button type="submit" class="btn-modern">S'inscrire</button>
          
          <div class="footer-link">
            <span>Déjà membre ?</span>
            <a (click)="goToLogin()">Se connecter</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card { width: 100%; max-width: 420px; padding: 40px; text-align: center; }
    .cni-logo { font-size: 2.5rem; font-weight: 900; background: linear-gradient(135deg, #1a237e, #4361ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .tagline { font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b; margin-bottom: 25px; }
    h2 { font-size: 1.6rem; color: #1e293b; margin-bottom: 5px; }
    .desc { color: #64748b; font-size: 0.9rem; margin-bottom: 25px; }
    
    .input-group { text-align: left; margin-bottom: 18px; }
    label { display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; color: #475569; }
    input { 
      width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; 
      background: rgba(255,255,255,0.5); transition: 0.3s; box-sizing: border-box; 
    }
    input:focus { outline: none; border-color: #4361ee; background: white; box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1); }

    .btn-modern { 
      width: 100%; padding: 14px; margin-top: 10px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, #4361ee, #4cc9f0); color: white;
      font-weight: 700; cursor: pointer; transition: 0.3s;
    }
    .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3); }

    .footer-link { margin-top: 20px; font-size: 0.85rem; color: #64748b; }
    a { color: #4361ee; font-weight: 700; cursor: pointer; margin-left: 5px; }
    .anim-fade-in { animation: fadeInUp 0.6s ease-out; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Objet envoyé à Laravel
  user = { nom: '', email: '', password: '' };

  onRegister() {
  // 1. Vérification basique
  if (!this.user.nom || !this.user.email || !this.user.password) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  // 2. Préparation des données pour Laravel (Mapping)
  const dataForLaravel = {
    name: this.user.nom,       // On transforme 'nom' en 'name'
    email: this.user.email,
    password: this.user.password,
    password_confirmation: this.user.password // Important si Laravel a la règle 'confirmed'
  };

  // 3. Appel à l'API
  this.http.post('http://localhost:3000/api/register', dataForLaravel).subscribe({
    next: (res: any) => {
      alert("✅ Compte créé avec succès !");
      this.router.navigate(['/login']);
    },
    error: (err) => {
      console.error("Détails de l'erreur :", err.error);
      
      // On affiche le message précis renvoyé par Laravel s'il existe
      const message = err.error?.message || "L'email est déjà utilisé ou le serveur est injoignable.";
      alert("❌ " + message);
    }
  });
}

  goToLogin() {
    this.router.navigate(['/login']);
  }
}