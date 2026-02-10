<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('projects', function (Blueprint $table) {
    $table->bigIncrements('id_project');
    $table->string('nom_projet'); 
    $table->text('description')->nullable();
    $table->date('date_fin');     
    $table->unsignedBigInteger('id_user_createur');
    


        $table->foreign('id_user_createur')
              ->references('id_user')
              ->on('users')
              ->onDelete('cascade');
        $table->timestamps();
    });
}


    public function down(): void
{
    Schema::dropIfExists('projects');
}

};