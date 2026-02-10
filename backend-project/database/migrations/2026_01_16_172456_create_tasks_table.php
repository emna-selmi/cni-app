<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // database/migrations/xxxx_create_tasks_table.php
    public function up(): void
{
    Schema::create('tasks', function (Blueprint $table) {
        $table->id('id_task'); // ou 'id' selon ton choix
        $table->string('titre'); // Vérifie bien que c'est 'titre' et non 'title'
        $table->text('description')->nullable();
        $table->string('etat')->default('Nouveau'); // Vérifie 'etat' et non 'status'
        $table->string('priorite')->default('Moyenne');
        $table->unsignedBigInteger('id_project');
        $table->unsignedBigInteger('id_user_assigne')->nullable();
        
        // Clés étrangères
        $table->foreign('id_project')->references('id_project')->on('projects')->onDelete('cascade');
        $table->foreign('id_user_assigne')->references('id_user')->on('users')->onDelete('set null');
        
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
