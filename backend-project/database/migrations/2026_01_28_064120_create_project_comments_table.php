<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('project_comments', function (Blueprint $table) {
        $table->id();
        $table->text('contenu');
        $table->unsignedBigInteger('id_project'); // La source
        $table->unsignedBigInteger('id_user');

        $table->foreign('id_project')
              ->references('id_project')
              ->on('projects')
              ->onDelete('cascade');

        $table->foreign('id_user')
              ->references('id_user')
              ->on('users')
              ->onDelete('cascade');
        $table->timestamps();
    });
}
    

    public function down(): void
    {
        Schema::dropIfExists('project_comments');
    }
};