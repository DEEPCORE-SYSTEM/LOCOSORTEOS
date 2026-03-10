<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            ALTER TABLE sorteos
            MODIFY COLUMN estado ENUM('borrador', 'programado', 'activo', 'finalizado', 'cancelado')
            NOT NULL DEFAULT 'programado'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE sorteos SET estado = 'programado' WHERE estado = 'borrador'");

        DB::statement("
            ALTER TABLE sorteos
            MODIFY COLUMN estado ENUM('programado', 'activo', 'finalizado', 'cancelado')
            NOT NULL DEFAULT 'programado'
        ");
    }
};

