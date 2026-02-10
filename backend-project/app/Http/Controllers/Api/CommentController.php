<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Task; // ✅ IMPORTANT
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    public function index($taskId)
    {
        $task = Task::findOrFail($taskId);
        $user = auth()->user();

        if (!$user->projects->contains($task->project)) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        return $task->comments()->with('user')->get();
    }

    public function store(Request $request, $taskId) // On reçoit taskId
{
    $validator = Validator::make($request->all(), [
        'contenu' => 'required|string', // Validation du champ contenu
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $user = auth()->user(); // Récupération via JWT
    if (!$user) {
        return response()->json(['error' => 'Utilisateur non authentifié'], 401);
    }

    // On cherche la tâche pour obtenir l'ID du projet associé
    $task = Task::find($taskId);
    if (!$task) {
        return response()->json(['error' => 'Tâche introuvable'], 404);
    }

    try {
        $comment = Comment::create([
            'contenu'      => $request->contenu,
            'date_comment' => now(), // Horodatage requis
            'id_project'   => $task->id_project, // On lie au projet de la tâche
            'id_task'      => $taskId,           // On lie à la tâche (ajoute ce champ en DB si besoin)
            'id_user'      => $user->id_user,    // Utilisation de id_user
        ]);

        return response()->json($comment, 201);
        
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
