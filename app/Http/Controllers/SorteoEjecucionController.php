<?php

namespace App\Http\Controllers;

use App\Models\Sorteo;
use App\Models\Ticket;
use App\Models\Ganador;
use Illuminate\Support\Facades\DB;

class SorteoEjecucionController extends Controller
{
    public function ejecutar($sorteoId)
    {
        $sorteo = Sorteo::with('premios')->findOrFail($sorteoId);

        DB::transaction(function () use ($sorteo) {

            // Tickets que participan (solo vendidos)
            $ticketsVendidos = Ticket::where('sorteo_id', $sorteo->id)
                ->where('estado', 'vendido')
                ->pluck('id')
                ->toArray();

            if (count($ticketsVendidos) === 0) {
                abort(400, 'No hay tickets vendidos.');
            }

            shuffle($ticketsVendidos); // aleatoriedad real

            foreach ($sorteo->premios as $index => $premio) {

                if (!isset($ticketsVendidos[$index])) {
                    break;
                }

                $ticketGanador = Ticket::find($ticketsVendidos[$index]);

                Ganador::create([
                    'premio_id' => $premio->id,
                    'ticket_id' => $ticketGanador->id,
                    'user_id' => $ticketGanador->user_id,
                    'fecha_sorteo' => now(),
                ]);
            }

            $sorteo->update(['estado' => 'finalizado']);
        });

        return back()->with('success', 'Sorteo ejecutado correctamente.');
    }
}
