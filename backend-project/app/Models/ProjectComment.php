<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectComment extends Model
{
    // On précise le nom de la table car Laravel cherchera "project_comments" par défaut
    protected $table = 'project_comments';
    protected $primaryKey = 'id_comment';

    protected $fillable = ['id_project', 'id_user', 'contenu'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}