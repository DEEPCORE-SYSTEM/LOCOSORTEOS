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
    Schema::create('ganadores', function (Blueprint $table) {
        $table->id();

        $table->foreignId('premio_id')->constrained()->onDelete('cascade');
        $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
        $table->foreignId('sorteo_id')->nullable()->constrained()->nullOnDelete();

        $table->dateTime('fecha_sorteo');
        $table->enum('tipo', ['manual', 'automatico'])->default('automatico');
        $table->string('imagen')->nullable();
        $table->boolean('destacado')->default(false);

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ganadores');
    }
};
