<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    private function reconcileApprovedTicketsForSorteo(int $sorteoId): void
    {
        \App\Models\Compra::with(['tickets:id,numero'])
            ->where('sorteo_id', $sorteoId)
            ->where('estado', 'aprobado')
            ->chunkById(100, function ($compras) use ($sorteoId) {
                foreach ($compras as $compra) {
                    $detalles = $compra->detalles ?? [];
                    $ticketsEsperados = collect($detalles['tickets'] ?? $detalles['numeros_asignados'] ?? $detalles['numeros_manuales'] ?? [])
                        ->filter()
                        ->map(fn ($numero) => trim((string) $numero))
                        ->unique()
                        ->values();

                    if ($ticketsEsperados->isEmpty()) {
                        continue;
                    }

                    $ticketsRelacion = $compra->tickets->keyBy('numero');
                    $ticketIds = [];

                    foreach ($ticketsEsperados as $numero) {
                        if ($ticketsRelacion->has($numero)) {
                            $ticketIds[] = $ticketsRelacion[$numero]->id;
                            continue;
                        }

                        $ticket = \App\Models\Ticket::firstOrNew([
                            'sorteo_id' => $sorteoId,
                            'numero' => $numero,
                        ]);

                        if ($ticket->exists) {
                            $tieneCompraAsignada = $ticket->compras()->exists();

                            // Un ticket impreso sin compra asociada puede reasignarse al comprador real.
                            if (
                                $ticket->estado === 'impreso' &&
                                ! $tieneCompraAsignada
                            ) {
                                $ticket->estado = 'vendido';
                                $ticket->participant_id = $compra->participant_id;
                                $ticket->fecha_venta = $ticket->fecha_venta ?? $compra->created_at;
                                $ticket->save();

                                $ticketIds[] = $ticket->id;
                                continue;
                            }

                            if ($ticket->estado === 'disponible') {
                                $ticket->estado = 'vendido';
                                $ticket->participant_id = $compra->participant_id;
                                $ticket->fecha_venta = $ticket->fecha_venta ?? $compra->created_at;
                                $ticket->save();
                            } else {
                                $ticketIds[] = $ticket->id;
                                continue;
                            }
                        }

                        $ticket->estado = 'vendido';
                        $ticket->participant_id = $compra->participant_id;
                        $ticket->fecha_venta = $ticket->fecha_venta ?? $compra->created_at;
                        $ticket->save();

                        $ticketIds[] = $ticket->id;
                    }

                    if (! empty($ticketIds)) {
                        $compra->tickets()->syncWithoutDetaching($ticketIds);
                    }

                    // Si no hay tickets esperados suficientes, no se intenta rellenar.
                }
            });
    }

    public function index(Request $request)
    {
        $periodo = $request->input('periodo', 'hoy');

        // Cache for 2 minutes using period as key
        $dashboardData = \Illuminate\Support\Facades\Cache::remember('admin_dashboard_data_' . $periodo, 120, function () use ($periodo) {
            
            $startDate = null;
            $endDate = now();
            $periodLabel = 'Desde siempre';

            switch ($periodo) {
                case 'semana':
                    $startDate = now()->startOfWeek();
                    $periodLabel = 'Esta semana';
                    break;
                case 'mes':
                    $startDate = now()->startOfMonth();
                    $periodLabel = 'Este mes';
                    break;
                case 'mes_anterior':
                    $startDate = now()->subMonth()->startOfMonth();
                    $endDate = now()->subMonth()->endOfMonth();
                    $periodLabel = 'Mes anterior';
                    break;
                case 'ano':
                    $startDate = now()->startOfYear();
                    $periodLabel = 'Este año';
                    break;
                case 'hoy':
                    $startDate = now()->startOfDay();
                    $endDate = now()->endOfDay();
                    $periodLabel = 'Hoy';
                    break;
                case 'todos':
                default:
                    $startDate = null;
                    $endDate = null;
                    break;
            }

            // --- Apply Date Filters
            $compraQuery = \App\Models\Compra::query();
            $ticketQuery = \App\Models\Ticket::query();
            
            if ($startDate && $endDate) {
                $compraQuery->whereBetween('created_at', [$startDate, $endDate]);
                $ticketQuery->whereBetween('created_at', [$startDate, $endDate]);
            } elseif ($startDate) {
                $compraQuery->where('created_at', '>=', $startDate);
                $ticketQuery->where('created_at', '>=', $startDate);
            }
            
            $pendingTicketsCount = \App\Models\Compra::where('estado', 'pendiente')->count(); // Pendientes always total time
            $activeSorteosCount = \App\Models\Sorteo::whereIn('estado', ['activo', 'programado'])->count();
            
            // KPI: Venta de Tickets en el periodo elegido
            $totalTicketsSold = $ticketQuery->where('estado', 'vendido')->count();
            
            // KPI: Ingresos (Compras aprobadas) en el periodo elegido
            $totalRevenue = $compraQuery->where('estado', 'aprobado')->sum('total');

            // --- Gráfica Rápida de Ventas de Semana (Últimos 7 días) vs Periodo
            $ventasSemana = [];
            // Siempre mostraremos los ultimos 7 dias en la bitácora gráfica como referencia
            $last7Days = now()->subDays(6)->startOfDay();
            $groupedTickets = \App\Models\Ticket::where('estado', 'vendido')
                ->where('created_at', '>=', $last7Days)
                ->selectRaw('DATE(created_at) as date, COUNT(id) as count')
                ->groupBy('date')
                ->pluck('count', 'date')->toArray();

            for ($i = 6; $i >= 0; $i--) {
                $dateString = now()->subDays($i)->toDateString();
                $ventasSemana[] = [
                    'day' => now()->subDays($i)->locale('es')->shortDayName,
                    'tickets' => $groupedTickets[$dateString] ?? 0
                ];
            }

            // --- Rendimiento Sorteos
            $rendimientoSorteos = \App\Models\Sorteo::whereIn('estado', ['activo', 'programado'])
                ->withCount(['tickets as sold' => function($q) { $q->where('estado', 'vendido'); }])
                ->take(3)
                ->get()
                ->map(function ($s) {
                    $progress = $s->cantidad_tickets > 0 ? round(($s->sold / $s->cantidad_tickets) * 100, 1) : 0;
                    return [
                        'id' => $s->id,
                        'name' => $s->nombre,
                        'price' => $s->precio_ticket,
                        'status' => ucfirst($s->estado), 
                        'sold' => $s->sold,
                        'total_tickets' => $s->cantidad_tickets,
                        'progress' => $progress,
                        'revenue' => $s->sold * $s->precio_ticket
                    ];
                });

            // --- Últimas 5 transacciones (globales, no afectadas por filtro)
            $transacciones = \App\Models\Compra::with('participante:id,name')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($c) {
                    return [
                        'id' => $c->id,
                        'user_name' => $c->participante?->name ?? 'Participante',
                        'method' => $c->metodo_pago,
                        'amount' => $c->total,
                        'status' => ucfirst($c->estado),
                        'date' => $c->created_at->format('d M Y - h:i A'),
                        'time_ago' => $c->created_at->locale('es')->diffForHumans()
                    ];
                });

            // --- Métodos de pago (Afectados por filtro de periodo)
            // Re-instantiate queries since they were mutated
            $compraMetodosQuery = \App\Models\Compra::query()->where('estado', 'aprobado')->whereIn('metodo_pago', ['yape', 'plin', 'transferencia', 'efectivo', 'web']);
            if ($startDate && $endDate) {
                $compraMetodosQuery->whereBetween('created_at', [$startDate, $endDate]);
            } elseif ($startDate) {
                $compraMetodosQuery->where('created_at', '>=', $startDate);
            }

            $metodos = $compraMetodosQuery->selectRaw('metodo_pago, sum(total) as revenue')
                ->groupBy('metodo_pago')
                ->pluck('revenue', 'metodo_pago')->toArray();
                
            $totalMetodos = array_sum($metodos);
            $origenPagos = [
                'yape' => ['amount' => $metodos['yape'] ?? 0, 'pct' => $totalMetodos > 0 ? round((($metodos['yape'] ?? 0) / $totalMetodos) * 100) : 0],
                'plin' => ['amount' => $metodos['plin'] ?? 0, 'pct' => $totalMetodos > 0 ? round((($metodos['plin'] ?? 0) / $totalMetodos) * 100) : 0],
                'transferencia' => ['amount' => $metodos['transferencia'] ?? 0, 'pct' => $totalMetodos > 0 ? round((($metodos['transferencia'] ?? 0) / $totalMetodos) * 100) : 0],
                'efectivo' => ['amount' => $metodos['efectivo'] ?? 0, 'pct' => $totalMetodos > 0 ? round((($metodos['efectivo'] ?? 0) / $totalMetodos) * 100) : 0]
            ];

            // --- Top Departamentos
            // Contamos tickets vendidos asociados a compras aprobadas, no compras.
            $compraDeptoQuery = \App\Models\Compra::join('participantes', 'compras.participant_id', '=', 'participantes.id')
                ->join('compra_ticket', 'compras.id', '=', 'compra_ticket.compra_id')
                ->join('tickets', 'compra_ticket.ticket_id', '=', 'tickets.id')
                ->where('compras.estado', 'aprobado')
                ->where('tickets.estado', 'vendido')
                ->whereNotNull('participantes.departamento')
                ->where('participantes.departamento', '<>', '');
            
            if ($startDate && $endDate) {
                $compraDeptoQuery->whereBetween('compras.created_at', [$startDate, $endDate]);
            } elseif ($startDate) {
                $compraDeptoQuery->where('compras.created_at', '>=', $startDate);
            }

            $topDeptos = $compraDeptoQuery
                ->selectRaw('participantes.departamento as departamento, count(distinct tickets.id) as total')
                ->groupBy('participantes.departamento')
                ->orderByDesc('total')
                ->take(3)
                ->get();

            return [
                'stats' => [
                    'revenue' => [
                        'total' => number_format($totalRevenue, 0, '.', ','),
                        'subtitle' => "En " . strtolower($periodLabel)
                    ],
                    'tickets' => [
                        'total' => number_format($totalTicketsSold, 0, '.', ','),
                        'subtitle' => "En " . strtolower($periodLabel)
                    ],
                    'pending' => $pendingTicketsCount,
                    'activeDraws' => $activeSorteosCount
                ],
                'ventasSemana' => $ventasSemana,
                'rendimientoSorteos' => $rendimientoSorteos,
                'transacciones' => $transacciones,
                'origenPagos' => $origenPagos,
                'topDepartamentos' => $topDeptos
            ];
        });

        // Add filter state back to view
        $dashboardData['filters'] = ['periodo' => $periodo];

        return Inertia::render('Admin/Dashboard', $dashboardData);
    }

    public function sorteos(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $perPage = $request->input('perPage', 25);
        $limit = $perPage === 'todos' ? 999999 : (int) $perPage;

        $query = \App\Models\Sorteo::with('premios')->withCount(['tickets as sold' => function($q) {
            $q->where('estado', 'vendido');
        }]);

        if ($search) {
            $query->where('nombre', 'like', "%{$search}%");
        }

        if ($status && $status !== 'todos') {
            $query->where('estado', $status);
        }

        $sorteosPaginated = $query->orderBy('created_at', 'desc')->paginate($limit)->withQueryString();

        $sorteosPaginated->getCollection()->transform(function($s) {
            return [
                'id'                  => $s->id,
                'name'                => $s->nombre,
                'date'                => date('d M Y', strtotime($s->fecha_sorteo ?? $s->fecha_fin)),
                'type'                => $s->tipo,
                'status'              => ucfirst($s->estado),
                'sold'                => $s->sold ?? 0,
                'total'               => $s->cantidad_tickets,
                'revenue'             => ($s->sold ?? 0) * $s->precio_ticket,
                
                'nombre'              => $s->nombre,
                'descripcion'         => $s->descripcion,
                'estado'              => $s->estado,
                'tipo'                => $s->tipo,
                'imagen_hero'         => $s->imagen_hero,
                'banner_promocional'  => $s->banner_promocional,
                'fecha_inicio'        => $s->fecha_inicio,
                'fecha_fin'           => $s->fecha_fin,
                'fecha_sorteo'        => $s->fecha_sorteo,
                'precio_ticket'       => $s->precio_ticket,
                'cantidad_tickets'    => $s->cantidad_tickets,
                'premios'             => $s->premios->map(fn($p) => [
                    'id'          => $p->id,
                    'nombre'      => $p->nombre,
                    'cantidad'    => $p->cantidad,
                    'descripcion' => $p->descripcion,
                    'imagen'      => $p->imagen,
                    'orden'       => $p->orden,
        ])->toArray(),
            ];
        });

        return Inertia::render('Admin/Sorteos', [
            'adminSorteosPaginated' => $sorteosPaginated,
            'filters' => ['perPage' => $perPage]
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
                'fecha_sorteo' => 'required|date|after_or_equal:fecha_fin',
                'cantidad_tickets' => 'required|integer|min:1',
                'precio_ticket' => 'required|numeric|min:0',
                'estado' => 'required|in:borrador,programado,activo,finalizado,cancelado',
            'prefijo_ticket' => 'nullable|string|max:20',
            'digitos_ticket' => 'nullable|integer|min:1|max:10',
            'premios' => 'nullable|array',
            'premios.*.nombre' => 'required|string',
            'premios.*.cantidad' => 'required|integer|min:1',
            'premios.*.descripcion' => 'nullable|string',
            'premios.*.imagen' => 'nullable|string',
            'premios.*.orden' => 'required|integer',
        ]);
        
        $data['user_id'] = auth()->id() ?? 1;
        $data['premios'] = collect($data['premios'] ?? [])
            ->map(function (array $premio) {
                $premio['tipo'] = filled($premio['tipo'] ?? null)
                    ? $premio['tipo']
                    : ($premio['nombre'] ?? null);

                return $premio;
            })
            ->all();

        $sorteo = \App\Models\Sorteo::create(\Illuminate\Support\Arr::except($data, ['premios']));

        if (!empty($data['premios'])) {
            $sorteo->premios()->createMany($data['premios']);
        }

        // Generar tickets de forma síncrona para que queden disponibles inmediatamente
        \App\Jobs\GenerarTicketsJob::dispatchSync($sorteo);

        return redirect()->route('admin.sorteos')->with('success', 'Sorteo creado exitosamente. Se están generando los tickets en segundo plano.');
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
                'fecha_sorteo' => 'required|date|after_or_equal:fecha_fin',
                'cantidad_tickets' => 'required|integer|min:1',
                'precio_ticket' => 'required|numeric|min:0',
                'estado' => 'required|in:borrador,programado,activo,finalizado,cancelado',
            'prefijo_ticket' => 'nullable|string|max:20',
            'digitos_ticket' => 'nullable|integer|min:1|max:10',
            'premios' => 'nullable|array',
            'premios.*.nombre' => 'required|string',
            'premios.*.cantidad' => 'required|integer|min:1',
            'premios.*.descripcion' => 'nullable|string',
            'premios.*.imagen' => 'nullable|string',
            'premios.*.orden' => 'required|integer',
        ]);

        $data['premios'] = collect($data['premios'] ?? [])
            ->map(function (array $premio) {
                $premio['tipo'] = filled($premio['tipo'] ?? null)
                    ? $premio['tipo']
                    : ($premio['nombre'] ?? null);

                return $premio;
            })
            ->all();

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
        
        if ($sorteo->tickets()->whereIn('estado', ['vendido', 'reservado'])->count() > 0) {
            return redirect()->back()->with('error', 'No puedes eliminar un sorteo que ya tiene tickets vendidos o reservados.');
        }

        $sorteo->premios()->delete();
        $sorteo->delete();

        return redirect()->back()->with('success', 'Sorteo eliminado exitosamente.');
    }

    public function ejecucion()
    {
        $sorteosBase = \App\Models\Sorteo::whereIn('estado', ['activo', 'programado'])->get(['id']);

        foreach ($sorteosBase as $sorteo) {
            $this->reconcileApprovedTicketsForSorteo($sorteo->id);
        }

        $sorteos = \App\Models\Sorteo::with(['premios'])->withCount(['tickets as valid_tickets_count' => function($query) {
            $query->whereRaw('LOWER(TRIM(estado)) IN (?, ?)', ['vendido', 'reservado']);
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
                'valid_tickets_count' => $sorteo->valid_tickets_count
            ];
        });

        return Inertia::render('Admin/Ejecucion', [
            'sorteosData' => $sorteos
        ]);
    }

    public function tickets(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('perPage', 25);
        $limit = $perPage === 'todos' ? 999999 : (int) $perPage;

        
        $pendientesQuery = \App\Models\Compra::with(['sorteo:id,nombre', 'participante'])
            ->where('estado', 'pendiente');

        if ($search) {
            $pendientesQuery->where(function($q) use ($search) {
                $cleanSearch = str_ireplace('COMPRA-', '', $search);

                $q->whereHas('participante', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                       ->orWhere('dni', 'like', "%{$search}%");
                })
                ->orWhere('detalles->buyer->name', 'like', "%{$search}%")
                ->orWhere('detalles->buyer->dni', 'like', "%{$search}%")
                ->orWhere('id', 'like', "%{$cleanSearch}%");
            });
        }

        $pendientesPaginated = $pendientesQuery->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'pend_page')
            ->withQueryString();

        $pendientesPaginated->getCollection()->transform(function ($c) {
                $buyer = [
                    'name' => $c->participante?->name,
                    'dni' => $c->participante?->dni,
                ];
                if (! $buyer['name'] || ! $buyer['dni']) {
                    $buyer = $c->detalles['buyer'] ?? [];
                }
                return [
                    'id'             => $c->id,
                    'user'           => $buyer['name'] ?? '—',
                    'user_dni'       => $buyer['dni'] ?? '—',
                    'sorteo'         => $c->sorteo?->nombre ?? '—',
                    'fecha'          => $c->created_at->format('d M Y H:i'),
                    'total'          => $c->total,
                    'metodo_pago'    => strtoupper($c->metodo_pago ?? '—'),
                    'estado'         => $c->estado,
                    'comprobante_url'=> $c->comprobante ? asset('storage/'.$c->comprobante) : null,
                    'detalles'       => $c->detalles,
                ];
            });

        $query = \App\Models\Compra::with(['sorteo', 'tickets:id,numero', 'participante'])
            ->where('estado', 'aprobado')
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function($q) use ($search) {
                
                $cleanSearch = str_ireplace('COMPRA-', '', $search);

                $q->whereHas('participante', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                       ->orWhere('dni', 'like', "%{$search}%");
                })
                ->orWhere('detalles->buyer->name', 'like', "%{$search}%")
                ->orWhere('detalles->buyer->dni', 'like', "%{$search}%")
                ->orWhere('id', 'like', "%{$cleanSearch}%")
                ->orWhereJsonContains('detalles->numeros_manuales', $search);
            });
        }

        $comprasPaginated = $query->paginate($limit, ['*'], 'page')->withQueryString();
            
        $comprasPaginated->getCollection()->transform(function ($c) {
            $detalles = $c->detalles;
            $ticketsRelacion = $c->tickets->pluck('numero')->values()->all();
            $ticketsDetalles = $detalles['tickets'] ?? $detalles['numeros_asignados'] ?? [];
            $detalles['tickets'] = ! empty($ticketsRelacion) ? $ticketsRelacion : $ticketsDetalles;
            $buyer = [
                'name' => $c->participante?->name,
                'dni' => $c->participante?->dni,
            ];
            if (! $buyer['name'] || ! $buyer['dni']) {
                $buyer = $detalles['buyer'] ?? [];
            }

            return [
                'id'             => $c->id,
                'user'           => $buyer['name'] ?? '—',
                'user_dni'       => $buyer['dni'] ?? '—',
                'sorteo'         => $c->sorteo?->nombre ?? '—',
                'fecha'          => $c->created_at->format('d M Y H:i'),
                'total'          => $c->total,
                'metodo_pago'    => strtoupper($c->metodo_pago ?? '—'),
                'estado'         => $c->estado,
                'comprobante_url'=> $c->comprobante ? asset('storage/'.$c->comprobante) : null,
                'detalles'       => $detalles,
            ];
        });

        $sorteos = \App\Models\Sorteo::select('id', 'nombre', 'cantidad_tickets', 'precio_ticket', 'estado', 'prefijo_ticket', 'digitos_ticket')
            ->whereIn('estado', ['activo', 'programado'])
            ->get();

        $ticketsData = []; 

        return Inertia::render('Admin/Tickets', [
            'comprasPaginated' => $comprasPaginated,
            'pendientesPaginated' => $pendientesPaginated,
            'sorteos'     => $sorteos,
            'ticketsData' => $ticketsData,
            'filters'     => ['search' => $search, 'perPage' => $perPage]
        ]);
    }

    public function usuarios(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $draw = $request->input('draw');
        $perPage = $request->input('perPage', 25);
        $limit = $perPage === 'todos' ? 999999 : (int) $perPage;

        $participantsQuery = \App\Models\Participante::query();

        if ($search) {
            $participantsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%")
                  ->orWhere('departamento', 'like', "%{$search}%")
                  ->orWhere('direccion', 'like', "%{$search}%");
            });
        }

        if ($status && $status !== 'todos') {
            if ($status === 'activos') {
                $participantsQuery->where('estado', 'activo');
            } elseif ($status === 'baneados') {
                $participantsQuery->where('estado', 'bloqueado');
            } elseif ($status === 'sin_compras') {
                $participantsQuery->whereDoesntHave('compras');
            }
        }

        if ($draw && $draw !== 'todos') {
            $participantsQuery->whereHas('compras.sorteo', function ($q) use ($draw) {
                $q->where('nombre', $draw);
            });
        }

        $participantsPaginated = $participantsQuery
            ->with([
                'compras' => function ($q) {
                    $q->select('id', 'participant_id', 'sorteo_id', 'total', 'metodo_pago', 'estado', 'detalles', 'created_at')
                        ->latest()
                        ->with([
                            'sorteo:id,nombre',
                            'tickets:id,numero',
                        ]);
                },
            ])
            ->withCount([
                'compras',
                'tickets as valid_tickets_count' => function ($q) {
                    $q->whereIn('estado', ['vendido', 'reservado', 'impreso']);
                },
            ])
            ->withSum([
                'compras as approved_total_sum' => function ($q) {
                    $q->where('estado', 'aprobado');
                },
            ], 'total')
            ->orderBy('created_at', 'desc')
            ->paginate($limit)
            ->withQueryString();

        $participantsPaginated->getCollection()->transform(function ($p) {
            $compras = $p->compras->sortByDesc('created_at')->values();

            $draws = $compras
                ->map(fn($c) => $c->sorteo?->nombre)
                ->filter()
                ->unique()
                ->values()
                ->toArray();

            $purchaseHistory = $compras->map(function ($compra) {
                $detalles = $compra->detalles ?? [];

                $ticketNumbers = $compra->tickets
                    ->pluck('numero')
                    ->merge(collect($detalles['tickets'] ?? $detalles['numeros_asignados'] ?? $detalles['numeros_manuales'] ?? []))
                    ->filter()
                    ->map(fn ($numero) => trim((string) $numero))
                    ->unique()
                    ->values()
                    ->all();

                return [
                    'id' => $compra->id,
                    'codigo' => 'TX-' . str_pad((string) $compra->id, 6, '0', STR_PAD_LEFT),
                    'sorteo' => $compra->sorteo?->nombre ?? '—',
                    'fecha' => optional($compra->created_at)->format('d/m/Y H:i'),
                    'estado' => $compra->estado ?? 'pendiente',
                    'metodoPago' => strtoupper((string) ($compra->metodo_pago ?? '—')),
                    'total' => (float) ($compra->total ?? 0),
                    'tickets' => $ticketNumbers,
                    'ticketsCount' => count($ticketNumbers),
                ];
            })->values()->all();

            return [
                'id' => $p->id,
                'name' => $p->name ?? '—',
                'dni' => $p->dni ?? '—',
                'phone' => $p->telefono ?? '-',
                'department' => $p->departamento ?? '',
                'address' => $p->direccion ?? '',
                'date' => optional($p->created_at)->format('d M Y'),
                'registeredAt' => optional($p->created_at)->format('d/m/Y H:i'),
                'totalTickets' => (int) ($p->valid_tickets_count ?? 0),
                'totalCompras' => (int) ($p->compras_count ?? 0),
                'totalGastado' => (float) ($p->approved_total_sum ?? 0),
                'lastPurchaseDate' => optional($compras->first()?->created_at)->format('d/m/Y H:i'),
                'status' => $p->estado ?? 'activo',
                'draws' => $draws,
                'history' => $purchaseHistory,
            ];
        });

        $adminUsersPaginated = $participantsPaginated;

        $sorteosList = \App\Models\Sorteo::select('id', 'nombre')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => ['id' => $s->id, 'nombre' => $s->nombre]);

        $participantStats = [
            'total' => \App\Models\Participante::count(),
            'activeWithPurchases' => \App\Models\Participante::whereHas('compras')->count(),
            'blocked' => \App\Models\Participante::where('estado', 'bloqueado')->count(),
        ];

        return Inertia::render('Admin/Usuarios', [
            'adminUsersPaginated' => $adminUsersPaginated,
            'sorteosData'    => $sorteosList,
            'participantStats' => $participantStats,
            'filters'        => ['perPage' => $perPage]
        ]);
    }

    public function storeUsuario(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'dni' => 'required|string|size:8|unique:participantes,dni',
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
            'status' => 'required|in:activo,bloqueado',
        ]);

        \App\Models\Participante::create([
            'name' => $data['name'],
            'dni' => $data['dni'],
            'telefono' => $data['phone'] ?: null,
            'departamento' => $data['department'] ?: null,
            'direccion' => $data['address'] ?: null,
            'estado' => $data['status'],
        ]);

        return redirect()->back()->with('success', 'Participante creado exitosamente.');
    }

    public function difusion(Request $request)
    {
        $perPage = $request->input('perPage', 25);
        $limit = $perPage === 'todos' ? 999999 : (int) $perPage;

        $mensajesPaginated = \App\Models\Mensaje::orderBy('created_at', 'desc')->paginate($limit)->withQueryString();
        
        $mensajesPaginated->getCollection()->transform(function($m) {
            return [
                'id' => $m->id,
                'title' => $m->title,
                'content' => $m->content,
                'type' => $m->type,
                'date' => $m->created_at->format('d M Y - h:i A')
            ];
        });

        return Inertia::render('Admin/Difusion', [
            'broadcastMessagesPaginated' => $mensajesPaginated,
            'filters' => ['perPage' => $perPage]
        ]);
    }

    public function storeMensaje(Request $request)
    {
        $data = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'type'    => 'required|in:news,alert,promo',
        ]);

        \App\Models\Mensaje::create($data);
        \Illuminate\Support\Facades\Cache::forget('broadcast_messages');

        return redirect()->back()->with('success', 'Publicación creada exitosamente.');
    }

    public function updateMensaje(Request $request, $id)
    {
        $mensaje = \App\Models\Mensaje::findOrFail($id);

        $data = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'type'    => 'required|in:news,alert,promo',
        ]);

        $mensaje->update($data);
        \Illuminate\Support\Facades\Cache::forget('broadcast_messages');

        return redirect()->back()->with('success', 'Publicación actualizada exitosamente.');
    }

    public function deleteMensaje($id)
    {
        \App\Models\Mensaje::findOrFail($id)->delete();
        \Illuminate\Support\Facades\Cache::forget('broadcast_messages');

        return redirect()->back()->with('success', 'Mensaje eliminado.');
    }

    public function toggleUserStatus($id)
    {
        $participante = \App\Models\Participante::findOrFail($id);
        $participante->estado = $participante->estado === 'activo' ? 'bloqueado' : 'activo';
        $participante->save();

        return redirect()->back()->with('success', 'El estado del participante ha sido actualizado.');
    }

    public function updateUsuario(Request $request, $id)
    {
        $participante = \App\Models\Participante::findOrFail($id);
        
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'dni' => 'required|string|size:8|unique:participantes,dni,'.$id,
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
            'status' => 'required|in:activo,bloqueado',
        ]);

        $participante->update([
            'name' => $data['name'],
            'dni' => $data['dni'],
            'telefono' => $data['phone'] ?: null,
            'departamento' => $data['department'] ?: null,
            'direccion' => $data['address'] ?: null,
            'estado' => $data['status'],
        ]);

        return redirect()->back()->with('success', 'Datos del participante actualizados exitosamente.');
    }

    public function destroyUsuario($id)
    {
        $participante = \App\Models\Participante::findOrFail($id);

        $comprasActivas = \App\Models\Compra::where('participant_id', $participante->id)
            ->whereIn('estado', ['pendiente', 'aprobado'])
            ->count();

        if ($comprasActivas > 0) {
            return redirect()->back()->with('error', 'No puedes eliminar un participante con compras activas o pendientes.');
        }

        $participante->delete();

        return redirect()->back()->with('success', 'Participante eliminado exitosamente.');
    }

    public function toggleSorteoEstado(Request $request, $id)
    {
        $sorteo = \App\Models\Sorteo::findOrFail($id);

        $nuevoEstado = $request->validate([
            'estado' => 'required|in:activo,programado,finalizado',
        ])['estado'];

        $sorteo->update(['estado' => $nuevoEstado]);

        return redirect()->back()->with('success', 'Estado del sorteo actualizado.');
    }

    public function getSettings()
    {
        return response()->json(\App\Models\SiteSettings::all_flat());
    }

    public function updateSettings(Request $request)
    {
        $allowed = [
            'hero_title', 'hero_subtitle', 'hero_fecha', 'link_redes',
            'yape_numero', 'plin_numero', 'whatsapp', 'tiktok_url',
            'razon_social',  
        ];

        foreach ($allowed as $key) {
            if ($request->has($key)) {
                \App\Models\SiteSettings::set($key, $request->input($key));
            }
        }

        
        \Illuminate\Support\Facades\Cache::forget('site_settings');

        return response()->json(['status' => 'ok']);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:10240',
        ]);

        $path = $request->file('image')->store('sorteos', 'public');
        $url  = asset('storage/' . $path);

        return response()->json(['url' => $url, 'path' => $path]);
    }

    public function apiTicketsStatus($sorteoId)
    {
        $this->reconcileApprovedTicketsForSorteo((int) $sorteoId);

        $nums = \App\Models\Ticket::where('sorteo_id', $sorteoId)
            ->whereRaw('LOWER(TRIM(estado)) IN (?, ?, ?)', ['vendido', 'reservado', 'impreso'])
            ->get(['numero', 'estado']);

        $normalized = $nums->mapWithKeys(function ($ticket) {
            return [$ticket->numero => strtolower(trim((string) $ticket->estado))];
        })->toArray();

        return response()->json($normalized);
    }

    public function apiDrawTicket(Request $request)
    {
        $sorteoId = $request->input('sorteo_id');
        $drawnNumbers = $request->input('drawn_numbers', []);

        $this->reconcileApprovedTicketsForSorteo((int) $sorteoId);

        $ticket = \App\Models\Ticket::where('sorteo_id', $sorteoId)
            ->whereRaw('LOWER(TRIM(estado)) IN (?, ?)', ['vendido', 'reservado'])
            ->whereNotIn('numero', $drawnNumbers)
            ->with(['participante:id,name', 'sorteo:id,nombre'])
            ->inRandomOrder()
            ->first();

        if (!$ticket) {
            return response()->json(['error' => 'No hay tickets válidos disponibles para sortear.'], 404);
        }

        return response()->json([
            'ticket_id' => $ticket->id,
            'number'    => $ticket->numero,
            'user'      => $ticket->participante?->name ?? 'Participante',
            'draw'      => $ticket->sorteo->nombre ?? 'Sorteo',
            'status'    => $ticket->estado
        ]);
    }
}
