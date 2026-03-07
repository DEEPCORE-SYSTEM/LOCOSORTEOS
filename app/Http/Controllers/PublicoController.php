<?php

namespace App\Http\Controllers;

use App\Models\Sorteo;
use App\Models\Ganador;
use App\Models\Compra;
use App\Models\Mensaje;
use App\Models\SiteSettings;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class PublicoController extends Controller
{
    // ─── Constantes ────────────────────────────────────────────────────────────

    private const TICKET_ESTADOS_DISPONIBLES = ['disponible'];
    private const CACHE_SETTINGS_TTL         = 3600; // 1 hora
    private const CACHE_MENSAJES_TTL         = 300;  // 5 minutos
    private const GANADORES_RECIENTES_LIMIT  = 8;
    private const GANADORES_PER_PAGE         = 24;
    private const SEARCH_MAX_LENGTH          = 100;


    // ─── Métodos privados de soporte ────────────────────────────────────────────

    /**
     * Devuelve la configuración del sitio cacheada.
     * Se invalida automáticamente al guardar configuración desde el admin.
     */
    private function getAppSettings(): array
    {
        return Cache::remember('site_settings', self::CACHE_SETTINGS_TTL, function () {
            $s = SiteSettings::all_flat();
            return [
                'yape_numero'  => $s['yape_numero']  ?? '',
                'plin_numero'  => $s['plin_numero']   ?? '',
                'whatsapp'     => $s['whatsapp']      ?? '',
                'razon_social' => $s['razon_social']  ?? 'INVERSIONES CampoAgro E.I.R.L.',
            ];
        });
    }

    /**
     * Formatea un ID de compra como transacción legible.
     */
    private function formatTransactionId(int $id): string
    {
        return 'TX-' . str_pad($id, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Obtiene los tickets disponibles de un sorteo (para grilla de selección).
     * Devuelve una colección que se serializa como array en JSON (checkout e index esperan array).
     */
    private function getTicketsDisponibles(int $sorteoId, ?string $search = null): \Illuminate\Contracts\Pagination\Paginator
    {
        $q = Ticket::where('sorteo_id', $sorteoId)
            ->whereIn('estado', self::TICKET_ESTADOS_DISPONIBLES)
            ->select('id', 'numero', 'estado')
            ->orderBy('numero');

        if ($search) {
            $q->where('numero', 'like', "%{$search}%");
        }

        return $q->simplePaginate(100)->withQueryString();
    }

    /**
     * Obtiene el primer sorteo activo con sus premios.
     */
    private function getSorteoActivo(bool $failOrNull = false): ?Sorteo
    {
        $query = Sorteo::with(['premios:id,sorteo_id,nombre,descripcion,imagen,orden'])
            ->where('estado', 'activo');

        return $failOrNull ? $query->firstOrFail() : $query->first();
    }

    /**
     * Obtiene los últimos ganadores del primer premio, cacheados y formateados.
     */
    private function getGanadoresRecientes(): \Illuminate\Support\Collection
    {
        return Ganador::with([
                'sorteo:id,nombre',
                'user:id,name',
                'premio:id,descripcion,nombre,orden',
            ])
            ->where('destacado', true) // Solo ganadores marcados como destacados
            ->orWhere(function($q) {
                // O si no hay suficientes destacados, los de primer puesto (fallback antiguo)
                $q->whereHas('premio', fn($p) => $p->where('orden', 1));
            })
            ->orderBy('destacado', 'desc') // Primero los marcados manualmente
            ->orderBy('created_at', 'desc')
            ->take(self::GANADORES_RECIENTES_LIMIT)
            ->get()
            ->map(fn($g) => [
                'id'     => $g->id,
                'name'   => $g->user?->name ?? 'Ganador',
                'prize'  => $g->premio?->descripcion ?? $g->premio?->nombre ?? 'Premio Mayor',
                'date'   => $g->created_at->format('d/m/Y'),
                'sorteo' => $g->sorteo?->nombre ?? '',
                'imagen' => $g->imagen ? asset('storage/' . $g->imagen) : null,
            ]);
    }

    /**
     * Mapea una colección de compras al formato de transacciones para el frontend.
     */
    private function mapTransacciones(\Illuminate\Support\Collection $compras): \Illuminate\Support\Collection
    {
        return $compras->map(fn($c) => [
            'id'        => $this->formatTransactionId($c->id),
            'compra_id' => $c->id,
            'date'      => $c->created_at->format('Y-m-d H:i'),
            'amount'    => (float) $c->total,
            'status'    => match ($c->estado) {
                'aprobado'  => 'Aprobado',
                'rechazado' => 'Rechazado',
                default     => 'Pendiente',
            },
            'draw'      => $c->sorteo?->nombre ?? '—',
            'user'      => $c->user?->name ?? $c->nombre ?? '—',
            'user_dni'  => $c->user?->dni ?? $c->dni ?? '—',
            'user_phone'=> $c->user?->telefono ?? $c->telefono ?? '—',
            'user_dept' => $c->user?->departamento ?? '—',
        ]);
    }

    /**
     * Mapea un ganador al formato esperado por el frontend de la página pública.
     */
    private function mapGanadorPublico($g): array
    {
        return [
            'id'     => $g->id,
            'user'   => $g->user?->name  ?? 'Anónimo',
            'dni'    => $g->user?->dni   ?? '—',
            'departamento' => $g->user?->departamento ?? 'Desconocida',
            'ticket' => $g->ticket?->numero ?? '—',
            'sorteo' => $g->sorteo?->nombre ?? '—',
            'premio' => $g->premio?->nombre ?? '—',
            'fecha'  => $g->created_at->format('d/m/Y'),
        ];
    }


    // ─── Controladores públicos ─────────────────────────────────────────────────

    /**
     * Página pública principal (Home / Welcome).
     */
    public function welcome()
    {
        $sorteos = Sorteo::with(['premios:id,sorteo_id,nombre,descripcion,imagen'])
            ->select('id', 'nombre', 'tipo', 'imagen_hero', 'descripcion', 'fecha_fin', 'precio_ticket', 'estado', 'cantidad_tickets')
            ->where('estado', 'activo')
            ->orderBy('fecha_fin', 'asc')
            ->get();

        return Inertia::render('Welcome', [
            'sorteo'         => $sorteos->first(),
            'otrosSorteos'   => $sorteos->skip(1)->values(),
            'ganadores'      => $this->getGanadoresRecientes(),
            'canLogin'       => Route::has('login'),
            'canRegister'    => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion'     => PHP_VERSION,
        ]);
    }

    /**
     * Página principal del sorteo activo con selección de tickets.
     */
    public function index(Request $request)
    {
        $sorteo = $this->getSorteoActivo(failOrNull: true);

        $search = $request->query('ticket_search');

        return Inertia::render('Publico/Index', [
            'sorteo'   => $sorteo,
            'tickets'  => $this->getTicketsDisponibles($sorteo->id, $search),
            'user'     => $request->user(),
            'settings' => $this->getAppSettings(),
        ]);
    }

    /**
     * Página pública de ganadores agrupada por Sorteo.
     */
    public function ganadores(Request $request)
    {
        $search = $request->input('search');

        if ($search && strlen($search) > self::SEARCH_MAX_LENGTH) {
            abort(422, 'Búsqueda demasiado larga.');
        }

        $querySorteos = Sorteo::whereHas('ganadores')
            ->orderBy('created_at', 'desc')
            ->with(['ganadores' => function ($query) use ($search) {
                // Eager load de las relaciones del ganador incl. el departamento del user
                $query->with(['ticket:id,numero', 'user:id,name,dni,departamento', 'premio:id,nombre'])
                      ->orderBy('created_at', 'asc');
                      
                // Filtro de búsqueda opcional sobre los ganadores
                if ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->whereHas('user',   fn($q2) => $q2->where('dni',    'like', "%{$search}%"))
                          ->orWhereHas('ticket', fn($q2) => $q2->where('numero', 'like', "%{$search}%"));
                    });
                }
            }]);

        // Si hay búsqueda, solo traer sorteos que tengan ganadores que cumplan el criterio
        if ($search) {
            $querySorteos->whereHas('ganadores', function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->whereHas('user',   fn($q3) => $q3->where('dni',    'like', "%{$search}%"))
                      ->orWhereHas('ticket', fn($q3) => $q3->where('numero', 'like', "%{$search}%"));
                });
            });
        }

        $sorteosPaginated = $querySorteos->paginate(self::GANADORES_PER_PAGE)->withQueryString();

        // Mapear cada sorteo con su lista de ganadores
        $sorteosPaginated->getCollection()->transform(function ($sorteo) {
            return [
                'id'      => $sorteo->id,
                'nombre'  => $sorteo->nombre,
                'fecha'   => $sorteo->created_at->format('d/m/Y'),
                'winners' => $sorteo->ganadores->map(fn($g) => $this->mapGanadorPublico($g))->values()->all()
            ];
        });

        return Inertia::render('Publico/Ganadores', [
            'sorteosPaginated' => $sorteosPaginated,
            'filters'          => $request->only('search'),
        ]);
    }

    /**
     * Dashboard del usuario autenticado con historial de transacciones.
     */
    public function dashboard(Request $request)
    {
        $sorteoIdRaw = $request->query('sorteo_id');
        $sorteoId = is_array($sorteoIdRaw) ? (int) ($sorteoIdRaw[0] ?? 0) : (int) $sorteoIdRaw;

        $querySorteos = Sorteo::with(['premios:id,sorteo_id,nombre,descripcion,imagen,orden'])
            ->where('estado', 'activo');

        $sorteosActivos = $querySorteos->get();

        if ($sorteoId > 0) {
            $sorteo = $sorteosActivos->firstWhere('id', $sorteoId) ?? $sorteosActivos->first();
        } else {
            $sorteo = $sorteosActivos->first();
        }

        $search = $request->query('ticket_search');
        $tickets = $sorteo ? $this->getTicketsDisponibles($sorteo->id, $search) : [];

        $transactions = $this->mapTransacciones(
            Compra::with(['sorteo:id,nombre', 'user:id,name,dni,telefono,departamento'])
                ->where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get()
        );

        return Inertia::render('User/Checkout', [
            'sorteo'              => $sorteo,
            'sorteosActivos'      => $sorteosActivos,
            'initialTransactions' => $transactions,
            'currentUser'         => $request->user(),
            'tickets'             => $tickets,
            'settings'            => $this->getAppSettings(),
        ]);
    }

    /**
     * Página de difusión / mensajes broadcast.
     */
    public function difusion()
    {
        $mensajes = Cache::remember('broadcast_messages', self::CACHE_MENSAJES_TTL, function () {
            return Mensaje::orderBy('created_at', 'desc')
                ->get()
                ->map(fn($m) => [
                    'id'      => $m->id,
                    'title'   => $m->title,
                    'content' => $m->content,
                    'type'    => $m->type,
                    'date'    => $m->created_at->locale('es')->diffForHumans(),
                ]);
        });

        return Inertia::render('Publico/Difusion', [
            'broadcastMessages' => $mensajes,
        ]);
    }

    /**
     * Actualiza los datos de contacto y ubicación del usuario autenticado.
     */
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'telefono'     => ['nullable', 'string', 'max:20'],
            'departamento' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $user->telefono = $validated['telefono'];
        $user->departamento = $validated['departamento'];
        $user->save();

        return back()->with('success', '¡Tus datos han sido actualizados exitosamente!');
    }

    /**
     * Muestra los tickets/números de una compra del usuario (propia, cualquier estado).
     */
    public function verTickets(Request $request, int $id)
    {
        $compra = Compra::with(['sorteo:id,nombre,prefijo_ticket', 'tickets:id,sorteo_id,numero,estado', 'user:id,name,dni,telefono,departamento'])
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $ticketsList = [];

        if ($compra->estado === 'aprobado') {
            $tickets = $compra->tickets;
            if ($tickets->isEmpty() && !empty($compra->detalles['numeros_asignados'])) {
                $tickets = Ticket::where('sorteo_id', $compra->sorteo_id)
                    ->whereIn('numero', $compra->detalles['numeros_asignados'])
                    ->orderBy('numero')
                    ->get(['id', 'sorteo_id', 'numero', 'estado']);
            }
            $ticketsList = $tickets->map(fn($t) => [
                'id'     => $t->id,
                'numero' => $t->numero,
                'estado' => $t->estado,
            ])->values()->all();
        } else {
            $raw = $compra->detalles['numeros_manuales'] ?? [];
            $numerosManuales = array_filter(array_map('intval', (array) $raw));
            $cantidad = (int) ($compra->detalles['cantidad'] ?? 0);
            if (!empty($numerosManuales)) {
                $ticketsFromDb = Ticket::whereIn('id', $numerosManuales)
                    ->orderBy('numero')
                    ->get(['id', 'numero']);
                foreach ($ticketsFromDb as $t) {
                    $ticketsList[] = [
                        'id'     => $t->id,
                        'numero' => $t->numero,
                        'estado' => $compra->estado,
                    ];
                }
            }
            if (empty($ticketsList) && $cantidad > 0) {
                for ($i = 0; $i < $cantidad; $i++) {
                    $ticketsList[] = [
                        'id'     => 'p-' . $i,
                        'numero' => $compra->estado === 'pendiente' ? 'Por asignar' : '—',
                        'estado' => $compra->estado,
                    ];
                }
            }
        }

        return Inertia::render('User/VerTickets', [
            'compra'  => [
                'id'           => $compra->id,
                'estado'       => $compra->estado,
                'total'        => (float) $compra->total,
                'fecha'        => $compra->created_at->format('d/m/Y H:i'),
                'transaccion'  => $this->formatTransactionId($compra->id),
                'user'         => $compra->user?->name ?? $compra->nombre ?? 'Anónimo',
                'user_dni'     => $compra->user?->dni ?? $compra->dni ?? '—',
                'user_phone'   => $compra->user?->telefono ?? $compra->telefono ?? '—',
                'user_dept'    => $compra->user?->departamento ?? '—',
            ],
            'sorteo'  => $compra->sorteo ? [
                'id'     => $compra->sorteo->id,
                'nombre' => $compra->sorteo->nombre,
            ] : null,
            'tickets' => $ticketsList,
        ]);
    }

    /**
     * Endpoint API para cargar tickets paginados (utilizado por el botón "Cargar más").
     */
    public function apiTickets(Request $request, int $sorteoId)
    {
        $search = $request->query('ticket_search');
        return response()->json([
            'tickets' => $this->getTicketsDisponibles($sorteoId, $search)
        ]);
    }
}