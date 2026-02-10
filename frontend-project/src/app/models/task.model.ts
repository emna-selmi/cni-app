export interface Task {
  id_task?: number;
  titre: string;
  description?: string;
  etat: 'Nouveau' | 'En cours' | 'En attente' | 'Terminé';
  priorite: 'Basse' | 'Moyenne' | 'Haute';
  id_project: number;
  id_user_assigne?: number;
  created_at?: string;
}

export interface Comment {
  id_comment?: number;
  contenu: string;
  date_comment: string;
  id_task: number;
  id_user: number;
  user?: { nom: string }; // Pour afficher le nom de l'auteur
}