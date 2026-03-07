<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TalonarioController extends Controller
{
    public function getTickets(Request $request)
    {
        $sorteoId = $request->input('sorteo_id');
        if (!$sorteoId) {
            return response()->json([]);
        }

        $sorteo = \App\Models\Sorteo::find($sorteoId);
        if (!$sorteo) {
            return response()->json([]);
        }

        $tickets = \App\Models\Ticket::where('sorteo_id', $sorteoId)
            ->whereIn('estado', ['vendido', 'reservado', 'impreso'])
            ->pluck('estado', 'numero')
            ->toArray();
            
        // Check reserved tickets in pending purchases
        $reservas = \App\Models\Compra::where('sorteo_id', $sorteoId)
            ->where('estado', 'pendiente')
            ->get();
            
        // Assuming TicketValidationController formatearNumeroTicket logic is needed, 
        // we'll implement it here as well for consistency.
        foreach ($reservas as $reserva) {
            $manuales = $reserva->detalles['numeros_manuales'] ?? [];
            foreach ($manuales as $num) {
                $numStr = $this->formatearNumeroTicket($num, $sorteo);
                if (!isset($tickets[$numStr])) {
                    $tickets[$numStr] = 'reservado';
                }
            }
        }

        return response()->json($tickets);
    }

    private function formatearNumeroTicket($numero, $sorteo): string
    {
        if (!is_numeric(str_replace(['-', ' ', '_'], '', $numero)) === false && preg_match('/[a-zA-Z]/', (string)$numero)) {
            return (string)$numero;
        }
        $digitos = $sorteo?->digitos_ticket ?? 3;
        $prefijo = $sorteo?->prefijo_ticket ?? '';
        $soloNumero = preg_replace('/[^0-9]/', '', (string)$numero);
        $numeroPadded = str_pad((int)$soloNumero, $digitos, '0', STR_PAD_LEFT);
        return $prefijo . $numeroPadded;
    }
}
