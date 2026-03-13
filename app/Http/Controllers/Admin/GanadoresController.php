<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ganador;
use App\Models\Participante;
use App\Models\Premio;
use App\Models\Sorteo;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class GanadoresController extends Controller
{
    private function resolveWinnerBuyer(Ganador $ganador): array
    {
        $ticket = $ganador->ticket;
        $participante = $ticket?->participante;

        if (! $participante && $ticket) {
            $compraConParticipante = $ticket->relationLoaded('compras')
                ? $ticket->compras->first(fn ($compra) => $compra->participante)
                : $ticket->compras()->with('participante:id,name,dni,telefono,departamento')->latest('compras.created_at')->first();

            $participante = $compraConParticipante?->participante;
        }

        return [
            'id' => $participante?->id,
            'name' => $participante?->name,
            'dni' => $participante?->dni,
            'telefono' => $participante?->telefono,
            'departamento' => $participante?->departamento,
        ];
    }

    private function validateWinnerRelations(array $data, ?Ganador $ganador = null): void
    {
        $sorteoId = (int) ($data['sorteo_id'] ?? $ganador?->sorteo_id);
        $ticketId = (int) ($data['ticket_id'] ?? $ganador?->ticket_id);
        $premioId = (int) ($data['premio_id'] ?? $ganador?->premio_id);

        $ticket = Ticket::findOrFail($ticketId);
        $premio = Premio::findOrFail($premioId);

        if ((int) $ticket->sorteo_id !== $sorteoId) {
            throw ValidationException::withMessages([
                'ticket_id' => 'El ticket seleccionado no pertenece al sorteo indicado.',
            ]);
        }

        if ((int) $premio->sorteo_id !== $sorteoId) {
            throw ValidationException::withMessages([
                'premio_id' => 'El premio seleccionado no pertenece al sorteo indicado.',
            ]);
        }
    }

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
            'ticket:id,numero,participant_id',
            'ticket.participante:id,name,dni,telefono,departamento',
            'ticket.compras' => function ($q) {
                $q->select('compras.id', 'compras.participant_id', 'compras.created_at')
                    ->with('participante:id,name,dni,telefono,departamento')
                    ->latest('compras.created_at');
            },
        ])->orderBy('created_at', 'desc');

        if ($sorteoF && $sorteoF !== 'todos') {
            $query->where('sorteo_id', $sorteoF);
        }

        if ($tipoF && $tipoF !== 'todos') {
            $query->where('tipo', $tipoF);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('ticket.participante', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                       ->orWhere('dni', 'like', "%{$search}%");
                })
                ->orWhereHas('ticket.compras.participante', function ($q2) use ($search) {
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
            $buyer = $this->resolveWinnerBuyer($g);

            return [
                'id'           => $g->id,
                'sorteo'       => $g->sorteo?->nombre ?? '—',
                'sorteo_id'    => $g->sorteo_id,
                'premio'       => $g->premio?->nombre ?? '—',
                'premio_id'    => $g->premio_id,
                'premio_imagen'=> $g->premio?->imagen ? asset('storage/' . $g->premio->imagen) : null,
                'ticket'       => $g->ticket?->numero ?? '—',
                'ticket_id'    => $g->ticket_id,
                'cliente_id'   => $buyer['id'] ?? null,
                'cliente'      => $buyer['name'] ?? '—',
                'dni'          => $buyer['dni'] ?? '—',
                'telefono'     => $buyer['telefono'] ?? '—',
                'departamento' => $buyer['departamento'] ?? '—',
                'tipo'         => $g->tipo,
                'fecha_sorteo' => $g->fecha_sorteo?->format('d M Y'),
                'fecha_sorteo_input' => $g->fecha_sorteo?->format('Y-m-d'),
                'imagen_path'  => $g->imagen,
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

        $participante = Participante::where('dni', $dni)->first();

        if (! $participante) {
            return response()->json(['error' => 'No se encontró ningún cliente con ese DNI.'], 404);
        }

        $tickets = Ticket::where('sorteo_id', $sorteoId)
            ->whereIn('estado', ['vendido', 'reservado', 'impreso'])
            ->where(function ($q) use ($participante) {
                $q->where('participant_id', $participante->id)
                    ->orWhereHas('compras', function ($q2) use ($participante) {
                        $q2->where('participant_id', $participante->id);
                    });
            })
            ->orderBy('numero')
            ->get(['id', 'numero', 'estado']);

        if ($tickets->isEmpty()) {
            return response()->json(['error' => 'Este cliente no tiene tickets en el sorteo seleccionado.'], 404);
        }

        return response()->json([
            'user' => [
                'id'           => $participante->id,
                'name'         => $participante->name ?? '—',
                'dni'          => $participante->dni ?? $dni,
                'telefono'     => $participante->telefono ?? '—',
                'departamento' => $participante->departamento ?? '—',
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
            'fecha_sorteo' => 'required|date',
            'imagen'       => 'nullable|string',
            'tipo'         => 'nullable|in:manual,automatico',
            'destacado'    => 'nullable|boolean',
        ]);

        $data['tipo'] = $data['tipo'] ?? 'manual';
        $data['imagen'] = $data['imagen'] ?: null;

        $this->validateWinnerRelations($data);

        $ganador = Ganador::create($data);

        // Si viene de axios (Ejecucion.jsx) → responder JSON
        if ($request->expectsJson() || !$request->hasHeader('X-Inertia')) {
            return response()->json(['ok' => true, 'id' => $ganador->id]);
        }

        return redirect()->back()->with('success', 'Ganador registrado exitosamente.');
    }


    /**
     * Actualizar un ganador
     */
    public function update(Request $request, $id)
    {
        $ganador = Ganador::findOrFail($id);

        $data = $request->validate([
            'sorteo_id'  => 'sometimes|required|exists:sorteos,id',
            'premio_id'  => 'sometimes|required|exists:premios,id',
            'ticket_id'  => 'sometimes|required|exists:tickets,id',
            'fecha_sorteo' => 'sometimes|required|date',
            'tipo'       => 'sometimes|required|in:manual,automatico',
            'imagen'    => 'nullable|string',
            'destacado' => 'nullable|boolean',
        ]);

        if (array_key_exists('imagen', $data) && ! $data['imagen']) {
            $data['imagen'] = null;
        }

        if (! empty(array_intersect(array_keys($data), ['sorteo_id', 'premio_id', 'ticket_id']))) {
            $this->validateWinnerRelations($data, $ganador);
        }

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
