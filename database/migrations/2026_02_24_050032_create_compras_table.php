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
    Schema::create('compras', function (Blueprint $table) {
        $table->id();

        
        $table->foreignId('user_id')->constrained()->onDelete('cascade');

        
        $table->foreignId('sorteo_id')->constrained()->onDelete('cascade');

        
        $table->decimal('total', 10, 2);

        
        $table->enum('metodo_pago', ['efectivo', 'yape', 'plin', 'transferencia', 'web']);

        
        $table->string('comprobante')->nullable();

        
        $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
