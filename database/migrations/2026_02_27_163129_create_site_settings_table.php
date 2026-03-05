<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        
        $defaults = [
            ['key' => 'hero_title',    'value' => '¡Gran Sorteo CampoAgro!'],
            ['key' => 'hero_subtitle', 'value' => 'Participa y gana increíbles premios'],
            ['key' => 'hero_fecha',    'value' => ''],
            ['key' => 'link_redes',    'value' => 'https://facebook.com/SorteosCampoAgroOficial'],
            ['key' => 'yape_numero',   'value' => ''],
            ['key' => 'plin_numero',   'value' => ''],
            ['key' => 'whatsapp',      'value' => ''],
        ];

        foreach ($defaults as $setting) {
            DB::table('site_settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
