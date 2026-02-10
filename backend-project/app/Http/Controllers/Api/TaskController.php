<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use App\Models\Notification;
use App\Models\User;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * Liste des tâches d'un projet
     */
    public function index(Request $request)
    {
        $request->validate([
            'id_project' => 'required|exists:projects,id_project'
        ]);

        return Task::where('id_project', $request->id_project)
            ->with(['assignee'])
            ->get();
    }

    /**
     * Création d'une tâche
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titre'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'etat'        => 'required|in:Nouveau,En cours,En attente,Terminé',
            'priorite'    => 'required|in:Basse,Moyenne,Haute',
            'id_project'  => 'required|exists:projects,id_project',
            'id_user_assigne' => 'nullable|exists:users,id_user',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task = Task::create([
            'titre'       => $request->titre,
            'description' => $request->description,
            'etat'        => $request->etat,
            'priorite'    => $request->priorite,
            'id_project'  => $request->id_project,
            'id_user_assigne' => $request->id_user_assigne
        ]);

        return response()->json([
            'message' => 'Tâche créée avec succès',
            'task' => $task
        ], 201);
    }
    public function store2(Request $request) {
    $task = Task::create($request->all());
    
    // On doit récupérer le projet pour avoir le créateur
    $project = Project::find($task->id_project);

    if ($project) {
        // 1. Notifier le créateur du projet
        Notification::create([
            'user_id' => $project->id_user_createur,
            'title' => 'Nouvelle tâche',
            'message' => 'Une tâche "' . $task->titre . '" a été ajoutée au projet.'
        ]);
    }

    // 2. Notifier les Admins
    $admins = User::where('role', 'Admin')->get();
    foreach($admins as $admin) {
        Notification::create([
            'id_user' => $admin->id_user, // Vérifie si c'est id ou id_user dans ta table notifications
            'title' => 'Activité Projet',
            'message' => 'Nouvelle tâche créée par ' . auth()->user()->nom
        ]);
    }
    return $task;
}

    /**
     * Assigner une tâche à un membre du projet
     */
    public function assignTask(Request $request, $id)
{
    $task = Task::findOrFail($id);
    $task->id_user_assigne = $request->id_user;
    $task->save();

    // Notification automatique pour le collaborateur (US.3)
    \App\Models\Notification::create([
        'user_id' => $task->id_user_assigne,
        'title'   => 'Nouvelle tâche',
        'message' => "Vous avez été assigné à la tâche : " . $task->titre,
        'is_read' => false
    ]);

    return response()->json(['message' => 'Tâche assignée et notification envoyée']);
}

    /**
     * Mise à jour du cycle de vie (Status)
     */
    public function updateStatus(Request $request, $id)
{
    try {
        $task = \App\Models\Task::with('project')->findOrFail($id);
        $nouveauStatut = $request->etat; 

        if (!$nouveauStatut) {
            return response()->json(['error' => 'Le champ etat est requis'], 400);
        }

        $task->update(['etat' => $nouveauStatut]);

        // === AJOUT ICI POUR LE JOURNAL D'ACTIVITÉ ===
        // Juste avant le ProjectLog::create
\Log::info("Titre de la tâche récupéré : " . $task->titre);
        \App\Models\ProjectLog::create([
    'id_project'  => $task->id_project,
    'user_id'     => auth()->id(),
    'action'      => "a changé le statut en $nouveauStatut",
    'description' => (string) $task->titre 
]);

        // Ton code de notification reste identique...
        $user = auth()->user();
        $destinataireId = ($user->id_user == $task->id_user_assigne) 
            ? $task->project->id_user_createur 
            : $task->id_user_assigne;

        if ($destinataireId && $destinataireId != $user->id_user) {
            \App\Models\Notification::create([
                'user_id'   => $destinataireId,
                'title'     => 'Mise à jour tâche',
                'message'   => "Tâche '{$task->titre}' passée à {$nouveauStatut}",
                'type'      => 'task',
                'target_id' => $id,
                'is_read'   => 0
            ]);
        }

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}



    private function sendTaskNotification($task, $currentUser, $oldStatus)
{
    // Scénario A : C'est l'Admin ou le Créateur qui change le statut -> On notifie l'assigné
    if ($currentUser->id_user != $task->id_user_assigned) {
        Notification::create([
            'user_id'   => $task->id_user_assigned,
            'title'     => 'Mise à jour de tâche',
            'message'   => "Votre tâche '{$task->nom_tache}' a été passée à {$task->status} par l'admin.",
            'type'      => 'task',
            'target_id' => $task->id_task,
            'is_read'   => 0
        ]);
    } 
    // Scénario B : C'est l'assigné qui change le statut -> On notifie le créateur du projet
    else {
        Notification::create([
            'user_id'   => $task->project->id_user_createur,
            'title'     => 'Avancement tâche',
            'message'   => "{$currentUser->nom} a marqué la tâche '{$task->nom_tache}' comme {$task->status}.",
            'type'      => 'task',
            'target_id' => $task->id_task,
            'is_read'   => 0
        ]);
    }
}


    /**
     * Ajoute un commentaire à une tâche
     * Mise à jour : Ajout de date_comment pour éviter l'erreur SQL 1364
     */
    public function addComment(Request $request, $id) 
{
    $request->validate(['contenu' => 'required|string']);

    try {
        // 1. On récupère la tâche AVEC son titre de manière explicite
        $task = \App\Models\Task::select('id_project', 'titre')->findOrFail($id); 

        // 2. Insertion du commentaire
        \DB::table('comments')->insert([
            'content'    => $request->contenu,
            'id_task'    => $id,
            'id_user'    => auth()->id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Création du Log avec le VRAI titre
        \App\Models\ProjectLog::create([
            'id_project'  => $task->id_project,
            'user_id'     => auth()->id(),
            'action'      => "a commenté la tâche",
            'description' => $task->titre // Assurez-vous que la colonne s'appelle bien 'titre' dans votre table 'tasks'
        ]);

        return response()->json(['message' => 'Commentaire ajouté !'], 201);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
    /**
     * Suppression d'une tâche
     */
    public function destroy($id)
    {
        Task::findOrFail($id)->delete();
        return response()->json(['message' => 'Tâche supprimée']);
    }

    /**
     * Tâches par projet pour le frontend
     */
    public function getTasksByProject($id)
{
    try {
        $tasks = Task::where('id_project', $id)
            ->with(['assignee', 'comments.user:id_user,nom']) // Ajout de user:id_user,nom
            ->get();

        return response()->json($tasks);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}