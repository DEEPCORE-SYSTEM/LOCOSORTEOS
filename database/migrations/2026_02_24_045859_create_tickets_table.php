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

        // Relación con el sorteo
        $table->foreignId('sorteo_id')->constrained()->onDelete('cascade');

        // Número del ticket (ej: 0001, 0250, 9999)
        $table->string('numero', 10);

        // Estado del ticket
        $table->enum('estado', ['disponible', 'reservado', 'vendido'])
              ->default('disponible');

        // A quién se vendió (puede ser null mientras no se venda)
        $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

        // Fecha de venta
        $table->dateTime('fecha_venta')->nullable();

        $table->timestamps();

        // Evita que se repita un número dentro del mismo sorteo
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
