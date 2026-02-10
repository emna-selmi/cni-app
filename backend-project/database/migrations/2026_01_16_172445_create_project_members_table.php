<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('project_members', function (Blueprint $table) {
    $table->id();
    
    // Déclare les colonnes en UNSIGNED BIG INTEGER (obligatoire pour les clés étrangères)
    $table->unsignedBigInteger('id_project');
    $table->unsignedBigInteger('id_user');

    // Définit les relations explicitement
    $table->foreign('id_project')
          ->references('id_project')
          ->on('projects')
          ->onDelete('cascade');

    $table->foreign('id_user')
          ->references('id_user')
          ->on('users')
          ->onDelete('cascade');

    $table->string('role_projet')->default('Développeur');
    $table->timestamps();
});
}

    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};
