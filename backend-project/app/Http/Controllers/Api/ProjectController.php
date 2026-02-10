<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Models\ProjectLog;
use App\Models\ProjectComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProjectController extends Controller
{
    /**
     * List all projects (user can be creator or member)
     */
    public function index()
    {
        $projects = Project::with('tasks')->get();

        $projects->transform(function ($project) {
            $total = $project->tasks->count();

            $completed = $project->tasks->filter(function ($t) {
                $s = str_replace(['é', 'è', 'ê'], 'e', strtolower(trim($t->etat ?? '')));
                return in_array($s, ['termine', 'done', 'complete']);
            })->count();

            $project->completion_rate = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

            return $project;
        });

        return response()->json($projects);
    }

    /**
     * Create a project
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom_projet' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_fin' => 'required|date',
        ]);

        $project = Project::create([
            'nom_projet' => $request->nom_projet,
            'description' => $request->description,
            'date_fin' => $request->date_fin,
            'id_user_createur' => auth()->id(),
        ]);

        return response()->json($project, 201);
    }

    /**
     * Add a member to a project
     */
    public function addMember(Request $request, $id)
    {
        $request->validate([
            'id_user' => 'required|exists:users,id_user',
            'role_projet' => 'nullable|string|max:255',
        ]);

        $project = Project::findOrFail($id);

        $project->members()->syncWithoutDetaching([
            $request->id_user => ['role_projet' => $request->role_projet ?? 'Développeur']
        ]);

        return response()->json(['message' => 'Membre ajouté avec succès !']);
    }

    /**
     * Remove a member from a project
     */
    public function removeMember($id, $userId)
    {
        $project = Project::findOrFail($id);
        $project->members()->detach($userId);
        return response()->json(['message' => 'Utilisateur retiré']);
    }

    /**
     * Get members of a project
     */
    public function getMembers($id)
    {
        $project = Project::with('members')->findOrFail($id);
        return response()->json($project->members);
    }

    /**
     * Get project comments
     */
    public function getComments($id)
    {
        $comments = DB::table('project_comments')
            ->join('users', 'project_comments.id_user', '=', 'users.id_user')
            ->where('project_comments.id_project', $id)
            ->select('project_comments.*', 'users.nom as user_nom')
            ->orderBy('project_comments.created_at', 'desc')
            ->get();

        $comments->transform(function ($comment) {
            $comment->created_at = Carbon::parse($comment->created_at, 'UTC')
                ->setTimezone('Africa/Tunis')
                ->toIso8601String();
            return $comment;
        });

        return response()->json($comments);
    }

    /**
     * Post a new comment
     */
    public function postComment(Request $request, $id_project)
    {
        $request->validate(['contenu' => 'required|string']);

        $comment = ProjectComment::create([
            'id_project' => $id_project,
            'id_user' => auth()->id(),
            'contenu' => $request->contenu,
        ]);

        return response()->json($comment, 201);
    }

    /**
     * Show project details
     */
    public function show($id)
{
    $project = Project::find($id); // Laravel cherchera id_project si défini comme primaryKey

    if (!$project) {
        return response()->json(['message' => 'Projet non trouvé'], 404);
    }

    return response()->json($project);
}

    /**
     * Update a project
     */
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $user = auth()->user();

        if ($user->role !== 'admin' && $user->id_user !== $project->id_user_createur) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $project->update($request->only([
            'nom_projet', 'description', 'date_debut', 'date_fin', 'status'
        ]));

        return response()->json($project);
    }

    /**
     * Get project logs
     */
    public function getLogs($id)
{
    // On récupère TOUS les logs du projet pour qu'ils restent affichés
    $logs = \App\Models\ProjectLog::where('id_project', $id)
        ->with('user:id_user,nom') 
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json($logs);
}

    /**
     * Delete a project
     */
    public function destroy($id)
    {
        $user = auth()->user();
        $project = Project::findOrFail($id);

        $isAdmin = strtolower($user->role) === 'admin';
        $isCreator = $user->id_user === $project->id_user_createur;

        if (!$isAdmin && !$isCreator) {
            return response()->json([
                'message' => 'Accès refusé. Seul l\'administrateur ou le créateur du projet peut le supprimer.'
            ], 403);
        }

        // Delete related entities safely
        $project->tasks()->delete();
        $project->members()->detach();
        $project->delete();

        return response()->json(['message' => 'Projet supprimé avec succès']);
    }
}
