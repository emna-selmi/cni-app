export interface User {
  id_user?: number;
  nom: string;
  email: string;
  role: 'Admin' | 'Utilisateur';
  password?: string;
}