<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CompraController extends Controller
{
    public function comprar(Request $request)
    {
        $ticketIds = $request->tickets; // array de tickets seleccionados
        $userId = auth()->id();

        return DB::transaction(function () use ($ticketIds, $userId, $request) {

            $tickets = Ticket::whereIn('id', $ticketIds)->lockForUpdate()->get();

            // Verificar disponibilidad
            foreach ($tickets as $ticket) {
                if ($ticket->estado !== 'disponible') {
                    abort(400, "Uno de los tickets ya fue vendido.");
                }
            }

            // Crear compra
            $compra = Compra::create([
                'user_id' => $userId,
                'sorteo_id' => $tickets->first()->sorteo_id,
                'total' => count($tickets) * $request->precio_ticket,
                'metodo_pago' => $request->metodo_pago,
                'comprobante' => $request->comprobante,
                'registrado_por' => $userId
            ]);

            // Marcar tickets como vendidos
            foreach ($tickets as $ticket) {
                $ticket->update([
                    'estado' => 'vendido',
                    'user_id' => $userId,
                    'fecha_venta' => now()
                ]);
            }

            // Relacionar compra con tickets
            $compra->tickets()->attach($ticketIds);

            return response()->json(['success' => true]);
        });
    }
}
