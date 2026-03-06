<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ganador;
use App\Models\Sorteo;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GanadoresController extends Controller
{
    /**
     * Listado paginado de ganadores con filtros
     */
    public function index(Request $request)
    {
        $search  = $request->input('search');
        $sorteoF = $request->input('sorteo_id');
        $tipoF   = $request->input('tipo');
        $perPage = $request->input('perPage', 25);
        $limit   = $perPage === 'todos' ? 999999 : (int) $perPage;

        $query = Ganador::with([
            'sorteo:id,nombre',
            'premio:id,nombre,imagen',
            'ticket:id,numero',
            'user:id,name,dni,telefono',
        ])->orderBy('created_at', 'desc');

        if ($sorteoF && $sorteoF !== 'todos') {
            $query->where('sorteo_id', $sorteoF);
        }

        if ($tipoF && $tipoF !== 'todos') {
            $query->where('tipo', $tipoF);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                       ->orWhere('dni', 'like', "%{$search}%");
                })
                ->orWhereHas('ticket', function ($q2) use ($search) {
                    $q2->where('numero', 'like', "%{$search}%");
                });
            });
        }

        $ganadores = $query->paginate($limit)->withQueryString();

        $ganadores->getCollection()->transform(function ($g) {
            return [
                'id'           => $g->id,
                'sorteo'       => $g->sorteo?->nombre ?? '—',
                'sorteo_id'    => $g->sorteo_id,
                'premio'       => $g->premio?->nombre ?? '—',
                'premio_imagen'=> $g->premio?->imagen ? asset('storage/' . $g->premio->imagen) : null,
                'ticket'       => $g->ticket?->numero ?? '—',
                'ticket_id'    => $g->ticket_id,
                'cliente'      => $g->user?->name ?? '—',
                'dni'          => $g->user?->dni ?? '—',
                'telefono'     => $g->user?->telefono ?? '—',
                'departamento' => $g->user?->departamento ?? '—',
                'tipo'         => $g->tipo,
                'fecha_sorteo' => $g->fecha_sorteo?->format('d M Y'),
                'imagen'       => $g->imagen ? asset('storage/' . $g->imagen) : null,
                'destacado'    => (bool) $g->destacado,
                'created_at'   => $g->created_at->format('d M Y'),
            ];
        });

        // Stats del header
        $totalGanadores   = Ganador::count();
        $totalManuales    = Ganador::where('tipo', 'manual')->count();
        $totalAutomaticos = Ganador::where('tipo', 'automatico')->count();

        // Sorteos para el filtro y el modal
        $sorteos = Sorteo::select('id', 'nombre', 'estado')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => ['id' => $s->id, 'nombre' => $s->nombre, 'estado' => $s->estado]);

        return Inertia::render('Admin/Ganadores', [
            'ganadores'        => $ganadores,
            'sorteos'          => $sorteos,
            'stats'            => [
                'total'      => $totalGanadores,
                'manuales'   => $totalManuales,
                'automaticos'=> $totalAutomaticos,
            ],
            'filters'          => [
                'search'    => $search,
                'sorteo_id' => $sorteoF,
                'tipo'      => $tipoF,
                'perPage'   => $perPage,
            ],
        ]);
    }

    /**
     * API: busca al usuario por DNI dentro de un sorteo y retorna sus tickets
     */
    public function apiClienteTickets(Request $request)
    {
        $dni      = $request->input('dni');
        $sorteoId = $request->input('sorteo_id');

        if (!$dni || !$sorteoId) {
            return response()->json(['error' => 'Faltan parámetros.'], 422);
        }

        $user = User::where('dni', $dni)->first();

        if (!$user) {
            return response()->json(['error' => 'No se encontró ningún cliente con ese DNI.'], 404);
        }

        $tickets = Ticket::where('sorteo_id', $sorteoId)
            ->where('user_id', $user->id)
            ->whereIn('estado', ['vendido', 'reservado', 'impreso'])
            ->get(['id', 'numero', 'estado']);

        if ($tickets->isEmpty()) {
            return response()->json(['error' => 'Este cliente no tiene tickets en el sorteo seleccionado.'], 404);
        }

        return response()->json([
            'user' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'dni'          => $user->dni,
                'telefono'     => $user->telefono ?? '—',
                'departamento' => $user->departamento ?? '—',
            ],
            'tickets' => $tickets->map(fn($t) => [
                'id'     => $t->id,
                'numero' => $t->numero,
                'estado' => $t->estado,
            ])->values(),
        ]);
    }

    /**
     * Registrar ganador (manual desde el módulo o automático desde la ruleta vía axios)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'sorteo_id'    => 'required|exists:sorteos,id',
            'premio_id'    => 'required|exists:premios,id',
            'ticket_id'    => 'required|exists:tickets,id',
            'user_id'      => 'required|exists:users,id',
            'fecha_sorteo' => 'required|date',
            'imagen'       => 'nullable|string',
            'tipo'         => 'nullable|in:manual,automatico',
            'destacado'    => 'nullable|boolean',
        ]);

        $data['tipo'] = $data['tipo'] ?? 'manual';

        $ganador = Ganador::create($data);

        // Si viene de axios (Ejecucion.jsx) → responder JSON
        if ($request->expectsJson() || !$request->hasHeader('X-Inertia')) {
            return response()->json(['ok' => true, 'id' => $ganador->id]);
        }

        return redirect()->back()->with('success', 'Ganador registrado exitosamente.');
    }


    /**
     * Actualizar imagen de un ganador
     */
    public function update(Request $request, $id)
    {
        $ganador = Ganador::findOrFail($id);

        $data = $request->validate([
            'imagen'    => 'nullable|string',
            'destacado' => 'nullable|boolean',
        ]);

        $ganador->update($data);

        return redirect()->back()->with('success', 'Ganador actualizado exitosamente.');
    }

    /**
     * Eliminar ganador
     */
    public function destroy($id)
    {
        Ganador::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Ganador eliminado exitosamente.');
    }

    /**
     * Upload de imagen del ganador
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:10240',
        ]);

        $path = $request->file('image')->store('ganadores', 'public');
        $url  = asset('storage/' . $path);

        return response()->json(['url' => $url, 'path' => $path]);
    }

    /**
     * API: premios de un sorteo (para el modal)
     */
    public function apiPremiosBySorteo($sorteoId)
    {
        $sorteo = Sorteo::with('premios:id,sorteo_id,nombre,imagen')->find($sorteoId);
        if (!$sorteo) {
            return response()->json([]);
        }
        return response()->json($sorteo->premios->map(fn($p) => [
            'id'     => $p->id,
            'nombre' => $p->nombre,
        ])->values());
    }
}
