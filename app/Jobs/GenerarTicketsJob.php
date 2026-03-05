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
        $digitos  = $this->sorteo->digitos_ticket ?? 5;
        $prefijo  = $this->sorteo->prefijo_ticket ? trim($this->sorteo->prefijo_ticket) . '' : '';

        $batch = [];
        $chunkSize = 1000; 

        for ($i = 1; $i <= $cantidad; $i++) {

            $numeroPadded = str_pad($i, $digitos, '0', STR_PAD_LEFT);
            $numeroFinal  = $prefijo . $numeroPadded;

            $batch[] = [
                'sorteo_id' => $this->sorteo->id,
                'numero' => $numeroFinal,
                'estado' => 'disponible',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($batch) === $chunkSize) {
                Ticket::insertOrIgnore($batch);
                $batch = [];
            }
        }

        
        if (!empty($batch)) {
            Ticket::insertOrIgnore($batch);
        }
    }
}
