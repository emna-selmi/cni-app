<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ChatController extends Controller
{
    private string $apiKey;
    private string $model;
    private int $dailyLimit = 20; // messages per day

    public function __construct()
    {
        $this->apiKey = config('gemini.api_key');
        $this->model  = config('gemini.model', 'gemini-2.5-flash');
    }

    /* ==============================
        NOUVELLE CONVERSATION
    ============================== */
    public function startNewChat()
    {
        $user = auth()->user();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        // Correction de la requête pour éviter le "Cardinality violation"
        $userConversationIds = Conversation::where('user_id', $user->id_user)->pluck('id');
        $messagesToday = Message::where('role', 'user')
            ->whereDate('created_at', Carbon::today())
            ->whereIn('conversation_id', $userConversationIds)
            ->count();

        if ($messagesToday >= $this->dailyLimit) {
            return response()->json([
                'error' => "Limite quotidienne atteinte ({$this->dailyLimit} messages).",
                'remaining' => 0
            ], 429);
        }

        $conversation = Conversation::create([
            'title'   => 'Nouvelle conversation',
            'user_id' => $user->id_user
        ]);

        $remaining = max(0, $this->dailyLimit - $messagesToday);

        return response()->json([
            'conversation' => $conversation,
            'remaining' => $remaining
        ]);
    }

    /* ==============================
        ENVOI MESSAGE
    ============================== */
    public function sendMessage(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        // Correction de la requête pour éviter le "Cardinality violation"
        $userConversationIds = Conversation::where('user_id', $user->id_user)->pluck('id');
        $messagesToday = Message::where('role', 'user')
            ->whereDate('created_at', Carbon::today())
            ->whereIn('conversation_id', $userConversationIds)
            ->count();

        if ($messagesToday >= $this->dailyLimit) {
            return response()->json([
                'error' => "Limite quotidienne atteinte ({$this->dailyLimit} messages).",
                'remaining' => 0
            ], 429);
        }

        $conversation = Conversation::where('id', $id)
            ->where('user_id', $user->id_user)
            ->with(['messages' => fn($q) => $q->orderBy('created_at', 'asc')])
            ->firstOrFail();

        $userPrompt = trim($request->input('message'));
        if ($userPrompt === '') return response()->json(['error' => 'Message vide'], 400);

        // Projects - Inclus tous les projets et la date de fin
        $projects = Project::all();
        $projectsText = $projects->count()
            ? $projects->map(fn($p) => "- {$p->nom_projet} (ID: {$p->id_project}, Date de fin: {$p->date_fin}, Créateur ID: {$p->id_user_createur})")->implode("\n")
            : "Aucun projet enregistré.";

        // Tasks - Correction spécifique pour envoyer les bonnes données au Bot
        $tasks = Task::with(['user', 'project'])->get();
        $tasksText = $tasks->count()
            ? $tasks->map(function($t) {
                $projectName = $t->project->nom_projet ?? 'N/A';
                $userName    = $t->user->nom ?? 'Non assigné';
                $prio = $t->priorite ?? 'N/A';
                $stat = $t->etat ?? 'N/A';
                return "- {$t->titre} [Projet: {$projectName}, Assigné à: {$userName}, Priorité: {$prio}, Statut: {$stat}]";
            })->implode("\n")
            : "Aucune tâche enregistrée.";

        // Users - Inclus le Rôle
        $users = User::all();
        $usersText = $users->count()
            ? $users->map(fn($u) => "- {$u->nom} (ID: {$u->id_user}, Rôle: {$u->role})")->implode("\n")
            : "Aucun utilisateur enregistré.";

        // System context
        $systemContext = <<<TEXT
Tu es ProjectBot, un assistant IA intelligent et conversationnel spécialisé en gestion de projets.

Règles :
1) Tu peux répondre normalement aux questions générales.
2) Pour les questions projets/tâches/utilisateurs, utilise UNIQUEMENT les données ci-dessous.
3) Si l'information n’existe pas, dis clairement que c'est indisponible.
4) N'invente jamais de projets, tâches ou utilisateurs.

DONNÉES ACTUELLES :

PROJETS :
$projectsText

TÂCHES :
$tasksText

UTILISATEURS :
$usersText
TEXT;

        // History
        $history = [];
        foreach ($conversation->messages as $msg) {
            $history[] = ['role' => $msg->role === 'user' ? 'user' : 'model', 'parts' => [['text' => $msg->content]]];
        }
        $history[] = ['role' => 'user', 'parts' => [['text' => $userPrompt]]];

        // Save user message
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $userPrompt
        ]);

        // Gemini request
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post($url, [
                    'contents' => $history,
                    'systemInstruction' => ['parts' => [['text' => $systemContext]]],
                    'generationConfig' => ['temperature' => 0.6, 'maxOutputTokens' => 2000]
                ]);

            if (!$response->successful()) {
                $resJson = $response->json();
                if (isset($resJson['error']['code']) && $resJson['error']['code'] == 429) {
                    return response()->json([
                        'error' => "Limite quotidienne atteinte ({$this->dailyLimit} messages).",
                        'remaining' => 0
                    ], 429);
                }
                Log::error('Gemini API error', $resJson);
                return response()->json(['error' => 'Erreur Gemini'], 500);
            }

            $aiText = data_get($response->json(), 'candidates.0.content.parts.0.text', 'Impossible de générer une réponse.');
            $aiMessage = Message::create([
                'conversation_id' => $conversation->id,
                'role' => 'model',
                'content' => $aiText
            ]);

            $remaining = max(0, $this->dailyLimit - ($messagesToday + 1));

            return response()->json(['message' => $aiMessage, 'remaining' => $remaining]);

        } catch (\Throwable $e) {
            Log::error('Chat error', ['exception' => $e]);
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }

    /* ==============================
        HISTORIQUE
    ============================== */
    public function getHistory()
    {
        $user = auth()->user();
        return Conversation::where('user_id', $user->id_user)
            ->with(['messages' => fn($q) => $q->orderBy('created_at', 'asc')])
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    /* ==============================
        SUPPRESSION
    ============================== */
    public function deleteConversation($id)
    {
        $conversation = Conversation::where('id', $id)
            ->where('user_id', auth()->user()->id_user)
            ->firstOrFail();

        $conversation->delete();
        return response()->json(['status' => 'success']);
    }
}