<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectLog extends Model
{
    use HasFactory;

    protected $fillable = [
    'id_project', 
    'user_id',
    'action',
    'description',
];

    public function project()
    {
        // Relation : project_id (local) -> id (clé primaire de Project)
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function user()
    {
        // Relation : user_id (local) -> id_user (clé primaire de User)
        // Vérifie bien si ta table Users utilise 'id' ou 'id_user'
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }
}
