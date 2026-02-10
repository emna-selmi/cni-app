<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id_user')->autoIncrement();

            $table->string('nom', 100);

            $table->string('email', 191)->unique();

            $table->string('password', 255);

            /**
             * Rôle GLOBAL de l'utilisateur
             * Exemples : 'admin', 'user'
             * ⚠️ Les rôles de projet (Chef, Testeur…) sont gérés
             * dans la table PROJECT_MEMBER (pivot)
             */
            $table->string('role', 50)->default('user');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
