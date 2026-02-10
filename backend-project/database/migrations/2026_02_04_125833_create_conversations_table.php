<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('conversations', function (Blueprint $table) {
        $table->id(); // ID de la conversation
        $table->string('title')->nullable();
        
        // On crée la colonne du même type que id_user (BigInt Unsigned)
        $table->unsignedBigInteger('user_id'); 
        
        $table->timestamps();

        // On définit la relation manuellement vers id_user
        $table->foreign('user_id')
              ->references('id_user') // <--- C'est ici le secret !
            ->on('users')
            ->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
