export interface ProjectMember {
  id_user: number;
  nom?: string;
  role_projet: 'Chef de projet' | 'Développeur' | 'Testeur' | 'Observateur';
}

export interface Project {
  id_project?: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin?: string;
  statut: 'Planifié' | 'En cours' | 'Terminé';
  membres: ProjectMember[];
}