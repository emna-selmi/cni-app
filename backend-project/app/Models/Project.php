<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    protected $table = 'projects';
    protected $primaryKey = 'id_project';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = ['nom_projet', 'description', 'date_fin', 'id_user_createur'];

    protected $appends = ['completion_rate'];

    /* ================= ACCESSEURS ================= */

    public function getCompletionRateAttribute()
    {
        // SECURITÉ : Si la relation n'est pas chargée ou s'il n'y a pas de tâches, on retourne 0
        if (!$this->tasks || $this->tasks->isEmpty()) {
            return 0;
        }

        $total = $this->tasks->count();
        
        $completed = $this->tasks->filter(function($task) {
            // Nettoyage de la chaîne pour la comparaison
            $etat = str_replace(['é', 'è', 'ê'], 'e', strtolower(trim($task->etat ?? '')));
            return in_array($etat, ['termine', 'done', 'complet', 'completed']);
        })->count();

        return (int)round(($completed / $total) * 100);
    }

    /* ================= RELATIONS ================= */

    public function creator()
    {
        return $this->belongsTo(User::class, 'id_user_createur', 'id_user_createur');
    }

    public function members()
    {
        return $this->belongsToMany(
            User::class, 
            'project_members', 
            'id_project', 
            'id_user'
        )->withPivot('role_projet')->withTimestamps();
    }

    public function users()
    {
        return $this->members();
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'id_project', 'id_project');
    }
}