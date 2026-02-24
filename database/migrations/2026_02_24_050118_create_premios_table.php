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
    Schema::create('premios', function (Blueprint $table) {
        $table->id();

        $table->foreignId('sorteo_id')->constrained()->onDelete('cascade');

        $table->string('nombre');
        $table->integer('cantidad')->default(1);
        $table->string('tipo')->nullable(); // Ej: Camioneta, Auto, Efectivo, Tecnología
        $table->text('descripcion')->nullable();
        $table->string('imagen')->nullable();

        // Orden del premio (1er premio, 2do, etc.)
        $table->integer('orden');

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('premios');
    }
};
