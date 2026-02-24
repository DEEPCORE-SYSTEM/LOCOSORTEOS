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
    Schema::create('sorteos', function (Blueprint $table) {
        $table->id();

        // Información del sorteo
        $table->string('nombre');
        $table->string('tipo')->default('General'); // ej: General, Especial
        $table->string('imagen_hero')->nullable();  // URL o path de la imagen de fondo
        $table->text('descripcion')->nullable();
        $table->dateTime('fecha_inicio');
        $table->dateTime('fecha_fin');

        // Configuración de tickets
        $table->integer('cantidad_tickets'); // total de números disponibles
        $table->decimal('precio_ticket', 10, 2);

        // Control del sorteo
        $table->enum('estado', ['programado', 'activo', 'finalizado', 'cancelado'])
              ->default('programado');

        // Quién creó el sorteo (admin)
        $table->foreignId('user_id')->constrained()->onDelete('cascade');

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sorteos');
    }
};
