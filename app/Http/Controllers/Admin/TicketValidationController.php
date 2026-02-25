<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Compra;
use App\Models\Ticket;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TicketValidationController extends Controller
{
    public function index()
    {
        $compras = Compra::with(['user', 'sorteo'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($compra) {
                return [
                    'id' => $compra->id,
                    'user' => $compra->user->name,
                    'user_dni' => $compra->user->dni,
                    'sorteo' => $compra->sorteo->nombre,
                    'total' => $compra->total,
                    'metodo_pago' => $compra->metodo_pago,
                    'estado' => $compra->estado,
                    'fecha' => $compra->created_at->format('Y-m-d H:i'),
                    'comprobante_url' => $compra->comprobante ? asset('storage/' . $compra->comprobante) : null,
                    'detalles' => $compra->detalles
                ];
            });

        $sorteos = \App\Models\Sorteo::where('estado', 'activo')->get();

        $ticketsPorSorteo = [];
        foreach ($sorteos as $sorteo) {
            
            $tickets = \App\Models\Ticket::where('sorteo_id', $sorteo->id)
                ->pluck('estado', 'numero')
                ->toArray();
            
            
            $reservas = \App\Models\Compra::where('sorteo_id', $sorteo->id)
                ->where('estado', 'pendiente')
                ->get();
                
            foreach ($reservas as $reserva) {
                $manuales = $reserva->detalles['numeros_manuales'] ?? [];
                foreach ($manuales as $num) {
                    $numStr = str_pad($num, 3, '0', STR_PAD_LEFT); 
                    if (!isset($tickets[$numStr])) {
                        $tickets[$numStr] = 'reservado';
                    }
                }
            }
            $ticketsPorSorteo[$sorteo->id] = $tickets;
        }

        return Inertia::render('Admin/Tickets', [
            'compras' => $compras,
            'sorteos' => $sorteos,
            'ticketsData' => $ticketsPorSorteo
        ]);
    }

    public function approve(Request $request, $id)
    {
        $compra = Compra::findOrFail($id);

        if ($compra->estado !== 'pendiente') {
            return redirect()->back()->with('error', 'Esta compra ya fue procesada.');
        }

        DB::transaction(function () use ($compra) {
            $compra->update(['estado' => 'aprobado']);
            
            $cantidad = $compra->detalles['cantidad'] ?? 1;
            $modo = $compra->detalles['modo_seleccion'] ?? 'random';
            $numerosManuales = $compra->detalles['numeros_manuales'] ?? [];

            
            $ticketsOcupados = Ticket::where('sorteo_id', $compra->sorteo_id)->pluck('numero')->toArray();

            $nuevosTickets = [];

            if ($modo === 'manual' && count($numerosManuales) == $cantidad) {
                
                foreach ($numerosManuales as $num) {
                    if (!in_array($num, $ticketsOcupados)) {
                         $nuevosTickets[] = $num;
                    } else {
                         
                         $nuevosTickets[] = $this->generarNumeroLibre($ticketsOcupados, $compra->sorteo_id);
                         $ticketsOcupados[] = end($nuevosTickets); 
                    }
                }
            } else {
                
                for ($i = 0; $i < $cantidad; $i++) {
                    $num = $this->generarNumeroLibre($ticketsOcupados, $compra->sorteo_id);
                    $nuevosTickets[] = $num;
                    $ticketsOcupados[] = $num;
                }
            }

            
            foreach ($nuevosTickets as $numStr) {
                Ticket::create([
                    'sorteo_id' => $compra->sorteo_id,
                    'numero' => str_pad($numStr, 3, '0', STR_PAD_LEFT),
                    'estado' => 'vendido',
                    'user_id' => $compra->user_id,
                    'fecha_venta' => now()
                ]);
            }
        });

        return redirect()->back()->with('success', 'Pago aprobado y tickets generados exitosamente.');
    }

    public function reject(Request $request, $id)
    {
        $request->validate(['motivo' => 'nullable|string|max:255']);
        $compra = Compra::findOrFail($id);
        
        if ($compra->estado !== 'pendiente') {
            return redirect()->back()->with('error', 'Esta compra ya fue procesada.');
        }

        $compra->update([
            'estado' => 'rechazado',
            'motivo_rechazo' => $request->motivo ?? 'Comprobante inválido o monto incorrecto'
        ]);

        return redirect()->back()->with('success', 'Pago rechazado correctamente.');
    }

    public function storeOffline(Request $request)
    {
        $request->validate([
            'sorteo_id' => 'required|exists:sorteos,id',
            'dni' => 'required|digits:8',
            'nombre' => 'required|string|max:255',
            'cantidad' => 'required|integer|min:1',
            'total' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {
            
            $user = \App\Models\User::firstOrCreate(
                ['dni' => $request->dni],
                [
                    'name' => $request->nombre,
                    'email' => $request->dni . '@offline.local', 
                    'password' => bcrypt($request->dni), 
                    'telefono' => '000000000',
                    'is_admin' => false
                ]
            );

            
            $compra = Compra::create([
                'user_id' => $user->id,
                'sorteo_id' => $request->sorteo_id,
                'total' => $request->total,
                'metodo_pago' => 'efectivo',
                'comprobante' => null,
                'estado' => 'aprobado', 
                'registrado_por' => auth()->id(), 
                'detalles' => [
                    'cantidad' => $request->cantidad,
                    'modo_seleccion' => 'random',
                    'tipo_venta' => 'Talonario Físico'
                ]
            ]);

            
            $ticketsOcupados = Ticket::where('sorteo_id', $compra->sorteo_id)->pluck('numero')->toArray();

            for ($i = 0; $i < $request->cantidad; $i++) {
                $numStr = $this->generarNumeroLibre($ticketsOcupados, $compra->sorteo_id);
                Ticket::create([
                    'sorteo_id' => $compra->sorteo_id,
                    'numero' => str_pad($numStr, 3, '0', STR_PAD_LEFT),
                    'estado' => 'vendido',
                    'user_id' => $compra->user_id,
                    'fecha_venta' => now()
                ]);
                $ticketsOcupados[] = $numStr;
            }
        });

        return redirect()->back()->with('success', 'Venta offline registrada y tickets generados exitosamente.');
    }

    private function generarNumeroLibre($ocupados, $sorteo_id)
    {
        
        for ($i=0; $i<1000; $i++) {
            $candidato = str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
            if (!in_array($candidato, $ocupados) && !in_array((int)$candidato, $ocupados)) {
                return $candidato;
            }
        }
        
        return str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
    }
}
