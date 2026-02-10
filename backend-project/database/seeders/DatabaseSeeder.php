<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // --- 1. NETTOYAGE COMPLET ---
        Schema::disableForeignKeyConstraints();
        Task::truncate();
        Project::truncate();
        User::truncate();
        DB::table('project_members')->truncate();
        Schema::enableForeignKeyConstraints();

        // --- 2. CRÉATION DES UTILISATEURS ---
        $admin = User::create([
            'nom' => 'Administrateur',
            'email' => 'admin@system.com',
            'password' => bcrypt('admin123'),
            'role' => 'Admin',
        ]);

        $user = User::create([
            'nom' => 'test Développeur',
            'email' => 'test@dev.com',
            'password' => bcrypt('user123'),
            'role' => 'Utilisateur',
        ]);

        // --- 3. CRÉATION DU PROJET ---
        $project = Project::create([
            'nom_projet'       => 'Projet de Démonstration',
            'description'      => 'Ceci est un projet généré pour le test.',
            'date_fin'         => '2026-12-31',
            'id_user_createur' => $admin->id_user,
        ]);

        $project->users()->attach($user->id_user, ['role_projet' => 'Développeur']);

        // --- 4. CRÉATION DES TÂCHES (Mapping Exact) ---
        Task::create([
            'titre'            => 'Analyse des besoins',
            'description'      => 'Première tâche du projet',
            'etat'             => 'Terminé',
            'priorite'         => 'Haute',
            'id_project'       => $project->id_project,
            'id_user_assigne'  => $admin->id_user // Utilise id_user_assigne comme dans ton fillable
        ]);

        Task::create([
            'titre'            => 'Développement Frontend',
            'description'      => 'Mise en place des composants Angular',
            'etat'             => 'En cours',
            'priorite'         => 'Moyenne',
            'id_project'       => $project->id_project,
            'id_user_assigne'  => $user->id_user
        ]);
    }
}