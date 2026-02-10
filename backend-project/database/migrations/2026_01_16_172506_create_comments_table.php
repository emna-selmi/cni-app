<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // database/migrations/xxxx_create_comments_table.php
    Schema::create('comments', function (Blueprint $table) {
    $table->id();
    $table->text('content');
    $table->foreignId('id_task')->constrained('tasks', 'id_task')->onDelete('cascade');
    $table->foreignId('id_user')->constrained('users', 'id_user')->onDelete('cascade');
    $table->timestamps(); // Pour l'horodatage requis
});
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};