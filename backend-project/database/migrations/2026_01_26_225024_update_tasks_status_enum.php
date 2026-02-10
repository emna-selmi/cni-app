<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('tasks', function (Blueprint $table) {
        // On modifie l'enum pour inclure 'En attente'
        // Note: Assurez-vous que le nom de la table est 'tasks' ou 'taches' selon votre DB
        $table->enum('etat', ['Nouveau', 'En cours', 'En attente', 'Terminé'])
            ->default('Nouveau')
            ->change();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
