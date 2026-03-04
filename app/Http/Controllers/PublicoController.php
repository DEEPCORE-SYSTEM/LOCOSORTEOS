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
    // ── Estados de ticket disponibles para compra ─────────────────────────────
    private const TICKET_ESTADOS_DISPONIBLES = ['disponible'];

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Devuelve la configuración del sitio cacheada 1 hora.
     * Se invalida automáticamente al guardar configuración desde el admin.
     */
    private function getAppSettings(): array
    {
        return Cache::remember('site_settings', 3600, function () {
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
     */
    private function getTicketsDisponibles(int $sorteoId): \Illuminate\Support\Collection
    {
        return Ticket::where('sorteo_id', $sorteoId)
            ->whereIn('estado', self::TICKET_ESTADOS_DISPONIBLES)
            ->select('id', 'numero', 'estado')
            ->orderBy('numero')
            ->get();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MÉTODOS PÚBLICOS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Página pública principal (Home / Welcome).
     */
    public function welcome()
    {
        $sorteos      = Sorteo::with(['premios:id,sorteo_id,nombre,descripcion,imagen'])
            ->select('id', 'nombre', 'tipo', 'imagen_hero', 'descripcion', 'fecha_fin', 'precio_ticket', 'estado', 'cantidad_tickets')
            ->where('estado', 'activo')
            ->orderBy('fecha_fin', 'asc')
            ->get();

        $sorteo       = $sorteos->first();
        $otrosSorteos = $sorteos->skip(1)->values();

        $ganadores = Ganador::with([
                'sorteo:id,nombre',
                'user:id,name',
                'premio:id,descripcion,nombre,orden',
            ])
            ->whereHas('premio', fn($q) => $q->where('orden', 1))
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get()
            ->map(fn($g) => [
                'id'     => $g->id,
                'name'   => $g->user?->name   ?? 'Ganador',
                'prize'  => $g->premio?->descripcion ?? $g->premio?->nombre ?? 'Premio Mayor',
                'date'   => $g->created_at->format('d/m/Y'),
                'sorteo' => $g->sorteo?->nombre ?? '',
            ]);

        return Inertia::render('Welcome', [
            'sorteo'         => $sorteo,
            'otrosSorteos'   => $otrosSorteos,
            'ganadores'      => $ganadores,
            'canLogin'       => Route::has('login'),
            'canRegister'    => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion'     => PHP_VERSION,
        ]);
    }

    /**
     * Página pública para participar en el sorteo activo.
     */
    public function index(Request $request)
    {
        $sorteo = Sorteo::with(['premios:id,sorteo_id,nombre,descripcion,imagen,orden'])
            ->where('estado', 'activo')
            ->firstOrFail();

        return Inertia::render('Publico/Index', [
            'sorteo'   => $sorteo,
            'tickets'  => $this->getTicketsDisponibles($sorteo->id),
            'user'     => $request->user(),
            'settings' => $this->getAppSettings(),
        ]);
    }

    /**
     * Página pública de ganadores con búsqueda y paginación.
     */
    public function ganadores(Request $request)
    {
        // Validar longitud máxima de búsqueda
        $search = $request->input('search');
        if ($search && strlen($search) > 100) {
            abort(422, 'Búsqueda demasiado larga.');
        }

        $query = Ganador::with([
                'sorteo:id,nombre',
                'ticket:id,numero',
                'user:id,name,dni',
                'premio:id,nombre',
            ])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user',   fn($q2) => $q2->where('dni',    'like', "%{$search}%"))
                  ->orWhereHas('ticket', fn($q2) => $q2->where('numero', 'like', "%{$search}%"));
            });
        }

        $ganadoresPaginated = $query->paginate(24)->withQueryString();

        // Null-safe en cada campo mapeado
        $ganadoresPaginated->getCollection()->transform(fn($g) => [
            'id'     => $g->id,
            'user'   => $g->user?->name   ?? 'Anónimo',
            'dni'    => $g->user?->dni    ?? '—',
            'ticket' => $g->ticket?->numero ?? '—',
            'sorteo' => $g->sorteo?->nombre ?? '—',
            'premio' => $g->premio?->nombre ?? '—',
            'fecha'  => $g->created_at->format('d/m/Y'),
        ]);

        return Inertia::render('Publico/Ganadores', [
            'ganadoresPaginated' => $ganadoresPaginated,
            'filters'            => $request->only('search'),
        ]);
    }

    /**
     * Panel del usuario autenticado: historial de compras + checkout.
     * Usa first() (no firstOrFail) para mostrar el panel aunque no haya sorteo activo.
     */
    public function dashboard(Request $request)
    {
        $sorteo = Sorteo::with(['premios:id,sorteo_id,nombre,descripcion'])
            ->where('estado', 'activo')
            ->first(); // null si no hay sorteo activo → el frontend lo maneja

        $transactions = Compra::with('sorteo:id,nombre')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($c) => [
                'id'     => $this->formatTransactionId($c->id),
                'date'   => $c->created_at->format('Y-m-d H:i'),
                'amount' => (float) $c->total,
                'status' => match ($c->estado) {
                    'aprobado'  => 'Aprobado',
                    'rechazado' => 'Rechazado',
                    default     => 'Pendiente',
                },
                'draw'   => $c->sorteo?->nombre ?? '—',
            ]);

        return Inertia::render('User/Checkout', [
            'sorteo'              => $sorteo,
            'initialTransactions' => $transactions,
            'currentUser'         => $request->user(),
            'tickets'             => $sorteo ? $this->getTicketsDisponibles($sorteo->id) : [],
            'settings'            => $this->getAppSettings(),
        ]);
    }

    /**
     * Página pública de difusión de mensajes y comunicados.
     * Cacheada 5 minutos (se invalida en AdminDashboardController al crear/editar).
     */
    public function difusion()
    {
        $mensajes = Cache::remember('broadcast_messages', 300, function () {
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
}