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

        $table->foreignId('participant_id')->nullable()->constrained('participantes')->nullOnDelete();

        
        $table->string('numero', 50);

        
        $table->enum('estado', ['disponible', 'reservado', 'vendido', 'impreso'])
              ->default('disponible');

        $table->dateTime('fecha_venta')->nullable();

        $table->timestamps();

        $table->unique(['sorteo_id', 'numero']);

        $table->index('estado');
        $table->index('created_at');
        $table->index(['estado', 'created_at']);
        $table->index(['sorteo_id', 'estado']);
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
