<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sorteos', function (Blueprint $table) {
            $table->dateTime('fecha_sorteo')->nullable()->after('fecha_fin');
        });

        DB::table('sorteos')
            ->whereNull('fecha_sorteo')
            ->update([
                'fecha_sorteo' => DB::raw('fecha_fin'),
            ]);
    }

    public function down(): void
    {
        Schema::table('sorteos', function (Blueprint $table) {
            $table->dropColumn('fecha_sorteo');
        });
    }
};
