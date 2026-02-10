<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;

    protected $table = 'tasks';
    protected $primaryKey = 'id_task';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = ['titre', 'description', 'etat', 'id_user_assigne', 'id_project', 'priorite'];

    /* ================= RELATIONS ================= */

    public function user()
{
    return $this->belongsTo(User::class, 'id_user_assigne', 'id_user');
}




    public function project() {
    return $this->belongsTo(Project::class, 'id_project');
}

    public function assignee()
    {
        return $this->belongsTo(
            User::class,
            'id_user_assigne', // La clé étrangère dans la table tasks
            'id_user'          // La clé primaire dans la table users
        );
    }

    /**
     * Relation avec les commentaires (Point 2.3 CDC)
     */
    public function comments()
    {
        return $this->hasMany(Comment::class, 'id_task', 'id_task');
    }

    /* ================= LOGIQUE MÉTIER (Règle 3.2 CDC) ================= */

    public function updateState(string $newState, User $user)
{
    $currentState = $this->etat; // On utilise 'etat'

    // Si l'état ne change pas, on ne fait rien
    if ($currentState === $newState) return;

    // Autoriser toutes les transitions pour le moment pour débloquer tes boutons
    $this->etat = $newState;
    $this->save();
}
}