<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ampliar campo numero en tickets (de string(10) a string(50))
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('numero', 50)->change();
        });

        // Agregar prefijo y dígitos al sorteo
        Schema::table('sorteos', function (Blueprint $table) {
            $table->string('prefijo_ticket', 20)->nullable()->after('cantidad_tickets');
            $table->unsignedTinyInteger('digitos_ticket')->default(3)->after('prefijo_ticket');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('numero', 10)->change();
        });

        Schema::table('sorteos', function (Blueprint $table) {
            $table->dropColumn(['prefijo_ticket', 'digitos_ticket']);
        });
    }
};
