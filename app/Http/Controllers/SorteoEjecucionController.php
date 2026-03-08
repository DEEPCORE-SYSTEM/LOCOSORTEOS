<?php

namespace App\Http\Controllers;

use App\Models\Sorteo;
use App\Models\Ticket;
use App\Models\Ganador;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SorteoEjecucionController extends Controller
{
    public function ejecutar($sorteoId)
    {
        $sorteo = Sorteo::with('premios')->findOrFail($sorteoId);

        if (! in_array($sorteo->estado, ['activo', 'programado'], true)) {
            abort(400, 'El sorteo ya fue ejecutado o no está disponible.');
        }

        $cantidadTicketsVendidos = Ticket::where('sorteo_id', $sorteo->id)
            ->where('estado', 'vendido')
            ->count();
            
        if ($cantidadTicketsVendidos === 0) {
            abort(400, 'No hay tickets vendidos.');
        }

        if ($cantidadTicketsVendidos < count($sorteo->premios)) {
            abort(400, sprintf(
                'Tickets insuficientes. Disponibles: %d, Premios: %d',
                $cantidadTicketsVendidos,
                count($sorteo->premios)
            ));
        }

        try {
            DB::transaction(function () use ($sorteo, $cantidadTicketsVendidos) {
                // Fetch random winning tickets directly from the DB to save massive amounts of RAM
                $ticketsGanadores = Ticket::where('sorteo_id', $sorteo->id)
                    ->where('estado', 'vendido')
                    ->inRandomOrder()
                    ->take(count($sorteo->premios))
                    ->get();
                
                $ticketsUsados = [];

                foreach ($sorteo->premios as $index => $premio) {
                    $ticketGanador = $ticketsGanadores[$index];

                    Ganador::create([
                        'premio_id'    => $premio->id,
                        'ticket_id'    => $ticketGanador->id,
                        'user_id'      => $ticketGanador->user_id,
                        'sorteo_id'    => $sorteo->id,
                        'fecha_sorteo' => now(),
                        'tipo'         => 'automatico',
                    ]);

                    $ticketsUsados[] = $ticketGanador->id;
                }

                $sorteo->update(['estado' => 'finalizado']);
                
                Log::info("Sorteo {$sorteo->id} ejecutado correctamente", [
                    'premios' => count($sorteo->premios),
                    'ganadores' => count($ticketsUsados),
                ]);
            });

            return back()->with('success', 'Sorteo ejecutado correctamente.');
        } catch (\Exception $e) {
            Log::error("Error ejecutando sorteo {$sorteo->id}: {$e->getMessage()}");
            abort(500, 'Error al ejecutar el sorteo.');
        }
    }
}
