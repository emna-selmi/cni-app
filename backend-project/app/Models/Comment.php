<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Comment extends Model
{
    use HasFactory;

    protected $table = 'comments';
    protected $primaryKey = 'id_comment'; // Vérifie si c'est bien id_comment ou id

    protected $fillable = [
    'content',
    'id_user',
    'id_task',    // Pour les commentaires de tâches 
    
    
];

    // Cette fonction s'exécute automatiquement avant la création en base
    protected static function booted()
    {
        static::creating(function ($comment) {
            if (!$comment->date_comment) {
                $comment->date_comment = now();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}