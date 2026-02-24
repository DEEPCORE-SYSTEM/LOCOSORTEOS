<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // TODO: Cargar pendientes desde base de datos
        $pendingTicketsCount = 0;
        
        return Inertia::render('Admin/Dashboard', [
            'pendingTicketsCount' => $pendingTicketsCount
        ]);
    }

    public function sorteos()
    {
        $sorteos = \App\Models\Sorteo::withCount(['tickets as sold' => function($query) {
            $query->where('estado', 'pagado');
        }])->get()->map(function($s) {
            return [
                'id' => $s->id,
                'name' => $s->nombre,
                'date' => date('d M Y', strtotime($s->fecha_fin)),
                'type' => $s->tipo,
                'status' => ucfirst($s->estado),
                'sold' => $s->sold ?? 0,
                'total' => $s->cantidad_tickets,
                'revenue' => ($s->sold ?? 0) * $s->precio_ticket
            ];
        });

        return Inertia::render('Admin/Sorteos', [
            'adminSorteos' => $sorteos
        ]);
    }

    public function createSorteo()
    {
        return Inertia::render('Admin/SorteoForm');
    }

    public function storeSorteo(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|string|max:255',
            'imagen_hero' => 'nullable|string',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'cantidad_tickets' => 'required|integer|min:1',
            'precio_ticket' => 'required|numeric|min:0',
            'estado' => 'required|string',
        ]);
        
        $data['user_id'] = auth()->id() ?? 1;

        \App\Models\Sorteo::create($data);

        return redirect()->route('admin.sorteos')->with('success', 'Sorteo creado exitosamente.');
    }

    public function editSorteo($id)
    {
        $sorteo = \App\Models\Sorteo::findOrFail($id);
        return Inertia::render('Admin/SorteoForm', ['sorteo' => $sorteo]);
    }

    public function updateSorteo(Request $request, $id)
    {
        $sorteo = \App\Models\Sorteo::findOrFail($id);

        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|string|max:255',
            'imagen_hero' => 'nullable|string',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'cantidad_tickets' => 'required|integer|min:1',
            'precio_ticket' => 'required|numeric|min:0',
            'estado' => 'required|string',
        ]);

        $sorteo->update($data);

        return redirect()->route('admin.sorteos')->with('success', 'Sorteo actualizado exitosamente.');
    }

    public function ejecucion()
    {
        $sorteos = \App\Models\Sorteo::with(['premios', 'tickets' => function($query) {
            $query->whereIn('estado', ['vendido', 'reservado'])->with('user'); 
        }])->whereIn('estado', ['activo', 'programado'])->get()->map(function($sorteo) {
            return [
                'id' => $sorteo->id,
                'nombre' => $sorteo->nombre,
                'premios' => $sorteo->premios->map(function($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->nombre,
                        'qty' => $p->cantidad
                    ];
                }),
                'tickets' => $sorteo->tickets->map(function($t) use ($sorteo) {
                    return [
                        'number' => $t->numero,
                        'user' => $t->user ? $t->user->name : 'Usuario Anónimo',
                        'draw' => $sorteo->nombre,
                        'status' => $t->estado
                    ];
                })
            ];
        });

        return Inertia::render('Admin/Ejecucion', [
            'sorteosData' => $sorteos
        ]);
    }

    public function tickets()
    {
        return Inertia::render('Admin/Tickets');
    }

    public function usuarios()
    {
        return Inertia::render('Admin/Usuarios');
    }

    public function contenido()
    {
        return Inertia::render('Admin/Contenido');
    }
}
