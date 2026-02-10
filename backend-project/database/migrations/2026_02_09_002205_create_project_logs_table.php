<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_logs', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id(); // auto increment PK

            $table->unsignedBigInteger('id_project');
            $table->unsignedBigInteger('user_id')->nullable();

            $table->string('action');
            $table->text('description')->nullable();

            $table->timestamps();

            // FK → projects.id_project
            $table->foreign('id_project')
                  ->references('id_project')
                  ->on('projects')
                  ->onDelete('cascade');

            // FK → users.id_user (MATCH your schema!)
            $table->foreign('user_id')
                  ->references('id_user')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_logs');
    }
};
