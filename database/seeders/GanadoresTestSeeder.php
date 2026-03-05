<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GanadoresTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creando 50 ganadores de prueba...');

        $tickets = DB::table('tickets')->where('estado', 'vendido')->inRandomOrder()->limit(50)->get();
        $now = Carbon::now();
        $ganadoresToInsert = [];

        foreach ($tickets as $ticket) {
            
            $premio = DB::table('premios')->where('sorteo_id', $ticket->sorteo_id)->inRandomOrder()->first();

            $ganadoresToInsert[] = [
                'user_id' => $ticket->user_id,
                'sorteo_id' => $ticket->sorteo_id,
                'ticket_id' => $ticket->id,
                'premio_id' => $premio ? $premio->id : null,
                'fecha_sorteo' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($ganadoresToInsert)) {
            DB::table('ganadores')->insert($ganadoresToInsert);
        }

        $this->command->info('50 ganadores insertados exitosamente.');
    }
}
