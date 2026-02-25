<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        
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
            'banner_promocional' => 'nullable|string',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'cantidad_tickets' => 'required|integer|min:1',
            'precio_ticket' => 'required|numeric|min:0',
            'estado' => 'required|string',
            'premios' => 'nullable|array',
            'premios.*.nombre' => 'required|string',
            'premios.*.descripcion' => 'nullable|string',
            'premios.*.imagen' => 'nullable|string',
            'premios.*.orden' => 'required|integer',
        ]);
        
        $data['user_id'] = auth()->id() ?? 1;

        $sorteo = \App\Models\Sorteo::create(\Illuminate\Support\Arr::except($data, ['premios']));

        if (!empty($data['premios'])) {
            $sorteo->premios()->createMany($data['premios']);
        }

        return redirect()->route('admin.sorteos')->with('success', 'Sorteo creado exitosamente.');
    }

    public function editSorteo($id)
    {
        $sorteo = \App\Models\Sorteo::with('premios')->findOrFail($id);
        return Inertia::render('Admin/SorteoForm', ['sorteo' => $sorteo]);
    }

    public function updateSorteo(Request $request, $id)
    {
        $sorteo = \App\Models\Sorteo::findOrFail($id);

        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|string|max:255',
            'imagen_hero' => 'nullable|string',
            'banner_promocional' => 'nullable|string',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'cantidad_tickets' => 'required|integer|min:1',
            'precio_ticket' => 'required|numeric|min:0',
            'estado' => 'required|string',
            'premios' => 'nullable|array',
            'premios.*.nombre' => 'required|string',
            'premios.*.descripcion' => 'nullable|string',
            'premios.*.imagen' => 'nullable|string',
            'premios.*.orden' => 'required|integer',
        ]);

        $sorteo->update(\Illuminate\Support\Arr::except($data, ['premios']));

        if (array_key_exists('premios', $data)) {
            $sorteo->premios()->delete();
            if (!empty($data['premios'])) {
                $sorteo->premios()->createMany($data['premios']);
            }
        }

        return redirect()->route('admin.sorteos')->with('success', 'Sorteo actualizado exitosamente.');
    }

    public function destroySorteo($id)
    {
        $sorteo = \App\Models\Sorteo::findOrFail($id);
        
        if ($sorteo->tickets()->count() > 0) {
            return redirect()->back()->with('error', 'No puedes eliminar un sorteo que ya tiene tickets registrados.');
        }

        $sorteo->premios()->delete();
        $sorteo->delete();

        return redirect()->back()->with('success', 'Sorteo eliminado exitosamente.');
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
        $adminUsers = \App\Models\User::where('is_admin', false)
            ->with(['tickets' => function($q) {
                $q->with('sorteo:id,nombre');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($u) {
                $draws = $u->tickets
                    ->map(fn($t) => optional($t->sorteo)->nombre)
                    ->filter()
                    ->unique()
                    ->values()
                    ->toArray();

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'dni' => $u->dni,
                    'phone' => $u->telefono ?? '-',
                    'date' => $u->created_at->format('d M Y'),
                    'totalTickets' => $u->tickets->count(),
                    'status' => $u->estado ?? 'activo',
                    'draws' => $draws,
                ];
            });

        $sorteosList = \App\Models\Sorteo::select('id', 'nombre')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => ['id' => $s->id, 'nombre' => $s->nombre]);

        return Inertia::render('Admin/Usuarios', [
            'adminUsersData' => $adminUsers,
            'sorteosData'    => $sorteosList,
        ]);
    }

    public function difusion()
    {
        $mensajes = \App\Models\Mensaje::orderBy('created_at', 'desc')->get()->map(function($m) {
            return [
                'id' => $m->id,
                'title' => $m->title,
                'content' => $m->content,
                'type' => $m->type,
                'date' => $m->created_at->format('d M Y - h:i A')
            ];
        });

        return Inertia::render('Admin/Difusion', [
            'broadcastMessagesData' => $mensajes
        ]);
    }

    public function storeMensaje(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:news,alert,promo',
        ]);

        \App\Models\Mensaje::create($data);

        return redirect()->back()->with('success', 'Publicación creada excitósamente.');
    }

    public function updateMensaje(Request $request, $id)
    {
        $mensaje = \App\Models\Mensaje::findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:news,alert,promo',
        ]);

        $mensaje->update($data);

        return redirect()->back()->with('success', 'Publicación actualizada exitosamente.');
    }

    public function deleteMensaje($id)
    {
        $mensaje = \App\Models\Mensaje::findOrFail($id);
        $mensaje->delete();

        return redirect()->back()->with('success', 'Mensaje eliminado.');
    }

    public function toggleUserStatus($id)
    {
        $user = \App\Models\User::findOrFail($id);
        
        if ($user->is_admin) {
            return redirect()->back()->with('error', 'No puedes alterar el estado de un administrador.');
        }

        $user->estado = $user->estado === 'activo' ? 'bloqueado' : 'activo';
        $user->save();

        return redirect()->back()->with('success', 'El estado del usuario ha sido actualizado.');
    }

    public function updateUsuario(Request $request, $id)
    {
        $user = \App\Models\User::findOrFail($id);
        
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'dni' => 'required|string|size:8|unique:users,dni,'.$id,
            'phone' => 'nullable|string|max:15',
        ]);

        $user->update([
            'name' => $data['name'],
            'dni' => $data['dni'],
            'telefono' => $data['phone']
        ]);

        return redirect()->back()->with('success', 'Datos del usuario actualizados exitosamente.');
    }
}
