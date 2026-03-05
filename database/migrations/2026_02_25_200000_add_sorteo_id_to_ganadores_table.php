<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ganadores', function (Blueprint $table) {
            
            $table->foreignId('sorteo_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ganadores', function (Blueprint $table) {
            $table->dropForeign(['sorteo_id']);
            $table->dropColumn('sorteo_id');
        });
    }
};
