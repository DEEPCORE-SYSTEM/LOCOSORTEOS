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
        Schema::table('compra_ticket', function (Blueprint $table) {
            $table->unique(['compra_id', 'ticket_id'], 'compra_ticket_compra_ticket_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('compra_ticket', function (Blueprint $table) {
            $table->dropUnique('compra_ticket_compra_ticket_unique');
        });
    }
};
