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

        
        $table->string('nombre');
        $table->string('tipo')->default('General'); 
        $table->string('imagen_hero')->nullable();  
        $table->text('descripcion')->nullable();
        $table->dateTime('fecha_inicio');
        $table->dateTime('fecha_fin');

        
        $table->integer('cantidad_tickets'); 
        $table->decimal('precio_ticket', 10, 2);

        
        $table->enum('estado', ['programado', 'activo', 'finalizado', 'cancelado'])
              ->default('programado');

        
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
