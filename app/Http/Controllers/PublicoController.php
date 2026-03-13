<?php

namespace App\Http\Controllers;

use App\Models\Sorteo;
use App\Models\Ganador;
use App\Models\Mensaje;
use App\Models\SiteSettings;
use App\Models\Ticket;
use App\Models\Compra;
use App\Models\Participante;
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
                'tiktok_url'   => $s['tiktok_url']    ?? '',
                'link_redes'   => $s['link_redes']    ?? '',
            ];
        });
    }

    /**
     * Resuelve los datos del participante ganador desde el ticket o, si falta, desde la compra asociada.
     */
    private function resolveWinnerParticipant(?Ganador $ganador): ?Participante
    {
        $ticket = $ganador?->ticket;

        if (! $ticket) {
            return null;
        }

        if ($ticket->participante) {
            return $ticket->participante;
        }

        $compraConParticipante = $ticket->relationLoaded('compras')
            ? $ticket->compras->first(fn ($compra) => $compra->participante)
            : $ticket->compras()->with('participante:id,name,dni,departamento')->latest('compras.created_at')->first();

        return $compraConParticipante?->participante;
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
        $query = Sorteo::with(['premios:id,sorteo_id,nombre,cantidad,tipo,descripcion,imagen,orden'])
            ->where('estado', 'activo')
            ->where('fecha_fin', '>', now());

        return $failOrNull ? $query->firstOrFail() : $query->first();
    }

    /**
     * Obtiene los últimos ganadores del primer premio, cacheados y formateados.
     */
    private function getGanadoresRecientes(): \Illuminate\Support\Collection
    {
        return Ganador::with([
                'sorteo:id,nombre',
                'premio:id,descripcion,nombre,orden',
                'ticket:id,numero,participant_id',
                'ticket.participante:id,name,departamento,dni',
                'ticket.compras' => function ($q) {
                    $q->select('compras.id', 'compras.participant_id', 'compras.created_at')
                        ->with('participante:id,name,dni,departamento')
                        ->latest('compras.created_at');
                },
            ])
            ->where('destacado', true) // Solo ganadores marcados como destacados
            ->orderBy('created_at', 'desc')
            ->take(self::GANADORES_RECIENTES_LIMIT)
            ->get()
            ->map(function ($g) {
                $participante = $this->resolveWinnerParticipant($g);

                return [
                    'id'     => $g->id,
                    'name'   => $participante?->name ?? 'Ganador',
                    'prize'  => $g->premio?->descripcion ?? $g->premio?->nombre ?? 'Premio Mayor',
                    'date'   => $g->created_at->format('d/m/Y'),
                    'sorteo' => $g->sorteo?->nombre ?? '',
                    'imagen' => $g->imagen ? asset('storage/' . $g->imagen) : null,
                ];
            });
    }

    /**
     * Mapea un ganador al formato esperado por el frontend de la página pública.
     */
    private function mapGanadorPublico($g): array
    {
        $participante = $this->resolveWinnerParticipant($g);

        return [
            'id'     => $g->id,
            'user'   => $participante?->name ?? 'Anónimo',
            'dni'    => $participante?->dni ?? '—',
            'departamento' => $participante?->departamento ?? 'Desconocida',
            'ticket' => $g->ticket?->numero ?? '—',
            'sorteo' => $g->sorteo?->nombre ?? '—',
            'premio' => $g->premio?->nombre ?? '—',
            'fecha'  => $g->created_at->format('d/m/Y'),
        ];
    }

    /**
     * Formatea el ID de compra para mostrarlo como transacción pública.
     */
    private function formatTransactionId(int $id): string
    {
        return 'TX-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Devuelve el DNI enmascarado (solo 4 primeros dígitos visibles).
     */
    private function maskDni(?string $dni): string
    {
        $clean = preg_replace('/\D/', '', (string) $dni);
        if ($clean === '') {
            return '';
        }

        $visible = substr($clean, 0, 4);
        $maskedCount = max(0, strlen($clean) - 4);
        return $visible . str_repeat('*', $maskedCount);
    }

    /**
     * Devuelve solo primer nombre y primer apellido.
     */
    private function formatDisplayName(?string $name): string
    {
        $name = trim((string) $name);
        if ($name === '') {
            return '';
        }

        $parts = preg_split('/\s+/', $name) ?: [];
        $first = $parts[0] ?? '';
        $last = $parts[count($parts) - 1] ?? '';

        if ($first === $last) {
            return $first;
        }

        return trim($first . ' ' . $last);
    }

    /**
     * Devuelve el enlace completo de transmisión para tickets públicos.
     */
    private function getLiveLink(array $settings): string
    {
        $rawUrl = trim((string) ($settings['tiktok_url'] ?? $settings['link_redes'] ?? ''));

        if ($rawUrl === '') {
            return 'https://tiktok.com/@campoagrooficial';
        }

        if (preg_match('/^https?:\/\//i', $rawUrl)) {
            return $rawUrl;
        }

        return 'https://' . $rawUrl;
    }

    /**
     * Devuelve la URL del QR para un enlace dado.
     */
    private function getQrUrl(string $link, int $size = 180): string
    {
        $size = max(80, $size);

        return 'https://api.qrserver.com/v1/create-qr-code/?size='
            . $size . 'x' . $size
            . '&data=' . urlencode($link);
    }


    // ─── Controladores públicos ─────────────────────────────────────────────────

    /**
     * Página pública principal (Home / Welcome).
     */
    public function welcome()
    {
        $sorteos = Sorteo::with(['premios:id,sorteo_id,nombre,cantidad,tipo,descripcion,imagen'])
            ->select('id', 'nombre', 'tipo', 'imagen_hero', 'descripcion', 'fecha_fin', 'fecha_sorteo', 'precio_ticket', 'estado', 'cantidad_tickets')
            ->where('estado', 'activo')
            ->where('fecha_fin', '>', now())
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
     * Checkout publico (sin login). Permite comprar tickets llenando los datos en el formulario.
     */
    public function checkoutPublic(Request $request)
    {
        $sorteoIdRaw = $request->query('sorteo_id');
        $sorteoId = is_array($sorteoIdRaw) ? (int) ($sorteoIdRaw[0] ?? 0) : (int) $sorteoIdRaw;

        $sorteosActivos = Sorteo::with(['premios:id,sorteo_id,nombre,cantidad,tipo,descripcion,imagen,orden'])
            ->where('estado', 'activo')
            ->where('fecha_fin', '>', now())
            ->get();

        $sorteo = $sorteoId > 0
            ? ($sorteosActivos->firstWhere('id', $sorteoId) ?? $sorteosActivos->first())
            : $sorteosActivos->first();

        $search = $request->query('ticket_search');
        $ticketsPaginator = $sorteo
            ? $this->getTicketsDisponibles($sorteo->id, $search)
            : null;

        $tickets = [
            'data'          => $ticketsPaginator?->items() ?? [],
            'next_page_url' => $ticketsPaginator?->nextPageUrl(),
        ];

        if (! $sorteo) {
            return redirect()->route('home')->with('error', 'No hay sorteos disponibles para comprar en este momento.');
        }

        return Inertia::render('Publico/Checkout', [
            'sorteo'         => $sorteo,
            'sorteosActivos' => $sorteosActivos,
            'tickets'        => $tickets,
            'settings'       => $this->getAppSettings(),
        ]);
    }

    /**
     * Página pública: el cliente ingresa su DNI y ve sus compras y tickets.
     */
    public function misTickets(Request $request)
    {
        $dni = (string) ($request->query('dni') ?? '');
        $dniClean = preg_replace('/\D/', '', $dni);

        $payload = [
            'dni' => $dniClean,
            'user' => null,
            'compras' => [],
            'ganadores' => [],
            'error' => null,
            'settings' => $this->getAppSettings(),
        ];

        if ($dniClean === '') {
            return Inertia::render('Publico/MisTickets', $payload);
        }

        if (strlen($dniClean) !== 8) {
            $payload['error'] = 'DNI inválido.';
            return Inertia::render('Publico/MisTickets', $payload);
        }

        $participante = Participante::where('dni', $dniClean)->first();
        if (! $participante || $participante->estado === 'bloqueado') {
            $payload['error'] = 'No se encontraron compras para ese DNI.';
            return Inertia::render('Publico/MisTickets', $payload);
        }

        $compras = Compra::with([
                'sorteo:id,nombre,precio_ticket,fecha_fin,fecha_sorteo',
                'tickets:id,numero',
            ])
            ->where('participant_id', $participante->id)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        if ($compras->isEmpty()) {
            $payload['error'] = 'No se encontraron compras para ese DNI.';
            return Inertia::render('Publico/MisTickets', $payload);
        }

        $comprasMapped = $compras->map(function (Compra $c) {
            $detalles = $c->detalles ?? [];
            $buyer = $detalles['buyer'] ?? [];
            $cantidad = (int) ($detalles['cantidad'] ?? 0);
            $modo = (string) ($detalles['modo_seleccion'] ?? 'random');
            $manual = array_values(array_unique(array_filter(array_map('strval', (array) ($detalles['numeros_manuales'] ?? [])))));

            $tickets = [];
            if ($c->estado === 'aprobado') {
                $tickets = $c->tickets->pluck('numero')->values()->all();
            } elseif ($modo === 'manual' && ! empty($manual)) {
                // En pendiente/rechazado mostramos los números solicitados (no necesariamente asignados).
                $tickets = $manual;
            } elseif ($cantidad > 0) {
                for ($i = 0; $i < $cantidad; $i++) {
                    $tickets[] = 'Por asignar';
                }
            }

            return [
                'id' => $c->id,
                'transaccion' => $this->formatTransactionId($c->id),
                'fecha' => $c->created_at->format('d/m/Y H:i'),
                'sorteo' => $c->sorteo?->nombre ?? '—',
                'sorteo_fecha' => ($c->sorteo?->fecha_sorteo ?? $c->sorteo?->fecha_fin)?->format('d/m/Y H:i') ?? '',
                'precio_ticket' => $c->sorteo?->precio_ticket !== null ? (float) $c->sorteo->precio_ticket : null,
                'total' => (float) $c->total,
                'estado' => $c->estado,
                'buyer_name' => $buyer['name'] ?? '',
                'buyer_telefono' => $buyer['telefono'] ?? '',
                'estado_label' => match ($c->estado) {
                    'aprobado' => 'Aprobado',
                    'rechazado' => 'Rechazado',
                    default => 'Pendiente',
                },
                'modo_seleccion' => $modo,
                'cantidad' => $cantidad,
                'tickets' => $tickets,
            ];
        })->values()->all();

        $ganadores = Ganador::with([
                'ticket:id,numero,participant_id',
                'premio:id,nombre,descripcion,orden',
                'sorteo:id,nombre',
            ])
            ->whereHas('ticket', function ($q) use ($participante) {
                $q->where('participant_id', $participante->id);
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($g) => [
                'id' => $g->id,
                'sorteo' => $g->sorteo?->nombre ?? '—',
                'ticket' => $g->ticket?->numero ?? '—',
                'premio' => $g->premio?->nombre ?? $g->premio?->descripcion ?? 'Premio',
                'fecha' => ($g->fecha_sorteo ?? $g->created_at)?->format('d/m/Y'),
            ])
            ->values()
            ->all();

        return Inertia::render('Publico/MisTickets', [
            'dni' => $dniClean,
            'user' => [
                'name' => $this->formatDisplayName($participante->name ?? ''),
                'dni' => $this->maskDni($participante->dni),
                'telefono' => $participante->telefono ?? '',
            ],
            'compras' => $comprasMapped,
            'ganadores' => $ganadores,
            'error' => null,
            'settings' => $this->getAppSettings(),
        ]);
    }

    /**
     * Exporta a PDF los tickets aprobados de una compra pública.
     */
    public function exportMisTickets(Request $request, Compra $compra)
    {
        $dniClean = preg_replace('/\D/', '', (string) ($request->query('dni') ?? ''));

        if (strlen($dniClean) !== 8) {
            return redirect()->route('mis_tickets')->with('error', 'DNI inválido para exportar tickets.');
        }

        $participante = Participante::where('dni', $dniClean)->first();
        if (! $participante || (int) $compra->participant_id !== (int) $participante->id) {
            return redirect()->route('mis_tickets', ['dni' => $dniClean])->with('error', 'La compra solicitada no pertenece a ese DNI.');
        }

        $compra->load([
            'sorteo:id,nombre,precio_ticket,fecha_fin,fecha_sorteo',
            'tickets:id,numero',
        ]);

        if ($compra->estado !== 'aprobado') {
            return redirect()->route('mis_tickets', ['dni' => $dniClean])->with('error', 'Solo puedes exportar tickets de compras aprobadas.');
        }

        $detalles = $compra->detalles ?? [];
        $ticketNumbers = $compra->tickets->pluck('numero')->filter()->values()->all();

        if (empty($ticketNumbers)) {
            $ticketNumbers = array_values(array_filter(array_map('strval', (array) ($detalles['tickets'] ?? $detalles['numeros_asignados'] ?? []))));
        }

        if (empty($ticketNumbers)) {
            return redirect()->route('mis_tickets', ['dni' => $dniClean])->with('error', 'No hay tickets válidos para exportar en esta compra.');
        }

        $settings = $this->getAppSettings();
        $liveLink = $this->getLiveLink($settings);
        $qrUrl = $this->getQrUrl($liveLink, 180);
        $pages = array_chunk($ticketNumbers, 4);
        $filename = 'Mis_Tickets_' . $this->formatTransactionId($compra->id) . '.pdf';

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.mis_tickets', [
                'compra' => $compra,
                'participante' => $participante,
                'pages' => $pages,
                'liveLink' => $liveLink,
                'qrUrl' => $qrUrl,
                'logoPath' => public_path('images/logo-campoagro.png'),
            ])
            ->setPaper('a4', 'portrait')
            ->setOption('isRemoteEnabled', true);

        return $pdf->download($filename);
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
                // Eager load de las relaciones del ganador incl. compras del ticket
                $query->with([
                        'ticket:id,numero,participant_id',
                        'ticket.participante:id,name,dni,departamento',
                        'ticket.compras' => function ($q) {
                            $q->select('compras.id', 'compras.participant_id', 'compras.created_at')
                                ->with('participante:id,name,dni,departamento')
                                ->latest('compras.created_at');
                        },
                        'premio:id,nombre',
                    ])
                      ->orderBy('created_at', 'asc');
                      
                // Filtro de búsqueda opcional sobre los ganadores
                if ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->whereHas('ticket.participante', fn($q2) => $q2->where('dni', 'like', "%{$search}%"))
                          ->orWhereHas('ticket.compras.participante', fn($q2) => $q2->where('dni', 'like', "%{$search}%"))
                          ->orWhereHas('ticket', fn($q2) => $q2->where('numero', 'like', "%{$search}%"));
                    });
                }
            }]);

        // Si hay búsqueda, solo traer sorteos que tengan ganadores que cumplan el criterio
        if ($search) {
            $querySorteos->whereHas('ganadores', function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->whereHas('ticket.participante', fn($q3) => $q3->where('dni', 'like', "%{$search}%"))
                      ->orWhereHas('ticket.compras.participante', fn($q3) => $q3->where('dni', 'like', "%{$search}%"))
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
     * Endpoint API para cargar tickets paginados (utilizado por el botón "Cargar más").
     */
    public function apiTickets(Request $request, int $sorteoId)
    {
        $sorteo = Sorteo::where('id', $sorteoId)
            ->where('estado', 'activo')
            ->where('fecha_fin', '>', now())
            ->first();

        if (! $sorteo) {
            return response()->json([
                'message' => 'Este sorteo ya no está disponible.',
                'tickets' => [
                    'data' => [],
                    'next_page_url' => null,
                ],
            ], 404);
        }

        $search = $request->query('ticket_search');
        return response()->json([
            'tickets' => $this->getTicketsDisponibles($sorteo->id, $search)
        ]);
    }
}
