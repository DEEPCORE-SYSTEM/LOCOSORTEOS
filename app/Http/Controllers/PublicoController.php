<?php

namespace App\Http\Controllers;

use App\Models\Sorteo;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Compra;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PublicoController extends Controller
{
    public function index()
    {
        $sorteo = Sorteo::where('estado','activo')->firstOrFail();

        return Inertia::render('Publico/Index', [
            'sorteo' => $sorteo,
            'tickets' => Ticket::where('sorteo_id',$sorteo->id)
                ->select('id','numero','estado')
                ->get()
        ]);
    }

    public function comprar(Request $request)
    {
        return DB::transaction(function () use ($request) {

            // Crear o encontrar cliente (sin login)
            $user = User::firstOrCreate(
                ['email' => $request->dni.'@cliente.com'],
                [
                    'name' => $request->nombre,
                    'password' => bcrypt('cliente'),
                ]
            );

            $tickets = Ticket::whereIn('id',$request->tickets)
                ->lockForUpdate()
                ->get();

            foreach ($tickets as $ticket) {
                if ($ticket->estado !== 'disponible') {
                    abort(400,'Ticket ya vendido');
                }
                event(new \App\Events\TicketVendido($ticket->id));

            }

            $compra = Compra::create([
                'user_id' => $user->id,
                'sorteo_id' => $tickets->first()->sorteo_id,
                'total' => count($tickets) * $request->precio,
                'metodo_pago' => 'web'
            ]);

            foreach ($tickets as $ticket) {
                $ticket->update([
                    'estado'=>'vendido',
                    'user_id'=>$user->id,
                    'fecha_venta'=>now()
                ]);
            }

            $compra->tickets()->attach($tickets->pluck('id'));

            return response()->json(['ok'=>true]);
        });
    }
}
