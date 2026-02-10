import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Créer un nouveau projet</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Nom du projet</label>
          <input type="text" [(ngModel)]="project.nom_projet" name="nom_projet" required>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="project.description" name="description"></textarea>
        </div>

        <div class="form-group">
          <label>Date de fin prévue</label>
          <input type="date" [(ngModel)]="project.date_fin" name="date_fin">
        </div>

        <button type="submit" class="btn-save">Enregistrer le projet</button>
        <button type="button" (click)="cancel()" class="btn-cancel">Annuler</button>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    .btn-save { background: #28a745; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 5px; }
    .btn-cancel { background: #6c757d; color: white; border: none; padding: 10px 15px; margin-left: 10px; cursor: pointer; border-radius: 5px; }
  `]
})
export class ProjectCreateComponent {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  // Objet vide pour stocker les données du formulaire
  project: any = {
    nom_projet: '',
    description: '',
    date_fin: '',
    status: 'En cours' // Valeur par défaut
  };

  onSubmit() {
    this.projectService.createProject(this.project).subscribe({
  next: (res) => {
    // Votre logique de redirection ou succès
    this.router.navigate(['/dashboard']);
  },
      error: (err: any) => {
        console.error('Erreur lors de la création:', err);
        alert('Erreur : Vérifiez que tous les champs sont remplis.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }
}