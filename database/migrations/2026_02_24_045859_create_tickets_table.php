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
    Schema::create('tickets', function (Blueprint $table) {
        $table->id();

        
        $table->foreignId('sorteo_id')->constrained()->onDelete('cascade');

        
        $table->string('numero', 10);

        
        $table->enum('estado', ['disponible', 'reservado', 'vendido'])
              ->default('disponible');

        
        $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

        
        $table->dateTime('fecha_venta')->nullable();

        $table->timestamps();

        
        $table->unique(['sorteo_id', 'numero']);
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
