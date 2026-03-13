<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participantes', function (Blueprint $table) {
            $table->id();

            $table->char('dni', 8)->unique();
            $table->string('name');
            $table->string('telefono', 20)->nullable();
            $table->string('departamento', 100)->nullable();
            $table->string('direccion')->nullable();
            $table->enum('estado', ['activo', 'bloqueado'])->default('activo');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participantes');
    }
};
