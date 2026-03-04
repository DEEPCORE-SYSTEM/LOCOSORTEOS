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

     
        if ($sorteo->estado !== 'pendiente') {
            abort(400, 'El sorteo ya fue ejecutado o no está disponible.');
        }

        $ticketsVendidos = Ticket::where('sorteo_id', $sorteo->id)
            ->where('estado', 'vendido')
            ->pluck('id')
            ->toArray();
        if (empty($ticketsVendidos)) {
            abort(400, 'No hay tickets vendidos.');
        }

        if (count($ticketsVendidos) < count($sorteo->premios)) {
            abort(400, sprintf(
                'Tickets insuficientes. Disponibles: %d, Premios: %d',
                count($ticketsVendidos),
                count($sorteo->premios)
            ));
        }

        try {
            DB::transaction(function () use ($sorteo, $ticketsVendidos) {
                shuffle($ticketsVendidos);
                
                $ticketsUsados = [];

                foreach ($sorteo->premios as $premio) {
                  
                    $ticketsDisponibles = array_diff($ticketsVendidos, $ticketsUsados);
                    $ticketId = $ticketsDisponibles[array_rand($ticketsDisponibles)];
                    
                    $ticketGanador = Ticket::find($ticketId);

                    Ganador::create([
                        'premio_id' => $premio->id,
                        'ticket_id' => $ticketGanador->id,
                        'user_id' => $ticketGanador->user_id,
                        'fecha_sorteo' => now(),
                    ]);

                    $ticketsUsados[] = $ticketId;
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