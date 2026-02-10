<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;
    use HasApiTokens, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id_user';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nom',
        'email',
        'password',
        'role' // rôle GLOBAL : admin / user
    ];

    protected $hidden = [
        'password'
    ];

    /* ================= JWT ================= */

    public function getJWTIdentifier()
    {
        return $this->getKey(); // retourne id_user
    }

    public function getJWTCustomClaims()
    {
        return [
            'nom'  => $this->nom,
            'role' => $this->role
        ];
    }

    /* ================= RELATIONS ================= */

    /**
     * Projets auxquels l'utilisateur participe
     * Relation N-N via project_members
     * Le rôle dans le projet est stocké dans le pivot (role_projet)
     */
    public function projects()
    {
        return $this->belongsToMany(
            Project::class,
            'project_members',
            'id_user',
            'id_project'
        )->withPivot('role_projet')
        ->withTimestamps();
    }

    /**
     * Projets créés par l'utilisateur
     */
    public function projectsCreated()
    {
        return $this->hasMany(
            Project::class,
            'id_user_createur',
            'id_user'
        );
    }

    /* ================= PASSWORD MUTATOR ================= */

    public function setPasswordAttribute($password)
    {
        if (!empty($password)) {
            $this->attributes['password'] =
                Hash::needsRehash($password)
                    ? bcrypt($password)
                    : $password;
        }
    }

    public function conversations() {
        return $this->hasMany(Conversation::class, 'user_id', 'id_user');
    }
    
}
