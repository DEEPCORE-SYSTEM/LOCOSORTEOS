<?php

namespace App\Jobs;

use App\Models\Sorteo;
use App\Models\Ticket;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerarTicketsJob implements ShouldQueue
{
    use Queueable;

    protected $sorteo;

    public function __construct(Sorteo $sorteo)
    {
        $this->sorteo = $sorteo;
    }

    public function handle(): void
    {
        $cantidad = $this->sorteo->cantidad_tickets;

        $batch = [];
        $chunkSize = 1000; 

        for ($i = 1; $i <= $cantidad; $i++) {

            $batch[] = [
                'sorteo_id' => $this->sorteo->id,
                'numero' => str_pad($i, 5, '0', STR_PAD_LEFT),
                'estado' => 'disponible',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($batch) === $chunkSize) {
                Ticket::insert($batch);
                $batch = [];
            }
        }

        
        if (!empty($batch)) {
            Ticket::insert($batch);
        }
    }
}
