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

        // Quién compró (cliente)
        $table->foreignId('user_id')->constrained()->onDelete('cascade');

        // Sorteo al que pertenece la compra
        $table->foreignId('sorteo_id')->constrained()->onDelete('cascade');

        // Total pagado
        $table->decimal('total', 10, 2);

        // Método de pago
        $table->enum('metodo_pago', ['efectivo', 'yape', 'plin', 'transferencia', 'web']);

        // Comprobante (imagen o código operación)
        $table->string('comprobante')->nullable();

        // Quién registró la venta (vendedor)
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
