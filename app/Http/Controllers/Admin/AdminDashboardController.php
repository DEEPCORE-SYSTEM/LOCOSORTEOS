<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $today = now()->startOfDay();
        $startOfWeek = now()->startOfWeek();
        
        // 1. STATS SECTION
        $pendingTicketsCount = \App\Models\Compra::where('estado', 'pendiente')->count();
        $activeSorteosCount = \App\Models\Sorteo::whereIn('estado', ['activo', 'programado'])->count();
        
        $totalTicketsSold = \App\Models\Ticket::where('estado', 'vendido')->count();
        $ticketsSoldToday = \App\Models\Ticket::where('estado', 'vendido')->where('created_at', '>=', $today)->count();
        
        // Revenue Total (suma de todas las compras aprobadas)
        $totalRevenue = \App\Models\Compra::where('estado', 'aprobado')->sum('total');
        $revenueThisWeek = \App\Models\Compra::where('estado', 'aprobado')->where('created_at', '>=', $startOfWeek)->sum('total');
        $revenuePct = $totalRevenue > 0 ? round(($revenueThisWeek / $totalRevenue) * 100, 1) : 0;

        // 2. VENTAS DE LA SEMANA (Últimos 7 días)
        $ventasSemana = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = \App\Models\Ticket::where('estado', 'vendido')
                ->whereDate('created_at', $date->toDateString())
                ->count();
            $ventasSemana[] = [
                'day' => $date->locale('es')->shortDayName, // Lun, Mar, etc
                'tickets' => $count
            ];
        }

        // 3. RENDIMIENTO POR SORTEO (Top 3 Activos)
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
                    'status' => ucfirst($s->estado), // Activo / Programado
                    'sold' => $s->sold,
                    'total_tickets' => $s->cantidad_tickets,
                    'progress' => $progress,
                    'revenue' => $s->sold * $s->precio_ticket
                ];
            });

        // 4. TRANSACCIONES RECIENTES
        $transacciones = \App\Models\Compra::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'user_name' => $c->user->name ?? 'Usuario Físico',
                    'method' => $c->metodo_pago,
                    'amount' => $c->total,
                    'status' => ucfirst($c->estado),
                    'date' => $c->created_at->format('d M Y - h:i A'),
                    'time_ago' => $c->created_at->locale('es')->diffForHumans()
                ];
            });

        // 5. ORIGEN DE PAGOS 
        // Filtramos solo métodos específicos para el chart, agrupados
        $metodos = \App\Models\Compra::selectRaw('metodo_pago, sum(total) as revenue')
            ->where('estado', 'aprobado')
            ->whereIn('metodo_pago', ['yape', 'plin', 'transferencia', 'efectivo', 'web'])
            ->groupBy('metodo_pago')
            ->pluck('revenue', 'metodo_pago')->toArray();
            
        $totalMetodos = array_sum($metodos);
        $origenPagos = [
            'yape' => ['amount' => $metodos['yape'] ?? 0, 'pct' => $totalMetodos > 0 ? round((($metodos['yape'] ?? 0) / $totalMetodos) * 100) : 0],
            'plin' => ['amount' => $metodos['plin'] ?? 0, 'pct' => $totalMetodos > 0 ? round((($metodos['plin'] ?? 0) / $totalMetodos) * 100) : 0],
            'transferencia' => ['amount' => $metodos['transferencia'] ?? 0, 'pct' => $totalMetodos > 0 ? round((($metodos['transferencia'] ?? 0) / $totalMetodos) * 100) : 0],
            'efectivo' => ['amount' => $metodos['efectivo'] ?? 0, 'pct' => $totalMetodos > 0 ? round((($metodos['efectivo'] ?? 0) / $totalMetodos) * 100) : 0]
        ];

        // 6. TOP DEPARTAMENTOS
        $topDeptos = \App\Models\Ticket::join('users', 'tickets.user_id', '=', 'users.id')
            ->whereNotNull('users.departamento')
            ->where('tickets.estado', 'vendido') // Sólo tickets vendidos reales
            ->selectRaw('users.departamento, count(tickets.id) as total')
            ->groupBy('users.departamento')
            ->orderByDesc('total')
            ->take(3)
            ->get();
        // Fallback robusto en caso de que no haya data de departamentos en BD
        $deptFallback = [];
        if ($topDeptos->isEmpty()) {
            $deptFallback = [
                ['departamento' => 'Lima', 'total' => 280],
                ['departamento' => 'Junin', 'total' => 120]
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'revenue' => [
                    'total' => number_format($totalRevenue, 0, '.', ','),
                    'subtitle' => "+$revenuePct% esta semana"
                ],
                'tickets' => [
                    'total' => number_format($totalTicketsSold, 0, '.', ','),
                    'subtitle' => "+$ticketsSoldToday hoy"
                ],
                'pending' => $pendingTicketsCount,
                'activeDraws' => $activeSorteosCount
            ],
            'ventasSemana' => $ventasSemana,
            'rendimientoSorteos' => $rendimientoSorteos,
            'transacciones' => $transacciones,
            'origenPagos' => $origenPagos,
            'topDepartamentos' => $topDeptos->isEmpty() ? $deptFallback : $topDeptos
        ]);
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
                'date'                => date('d M Y', strtotime($s->fecha_fin)),
                'type'                => $s->tipo,
                'status'              => ucfirst($s->estado),
                'sold'                => $s->sold ?? 0,
                'total'               => $s->cantidad_tickets,
                'revenue'             => ($s->sold ?? 0) * $s->precio_ticket,
                // Campos para edición en modal
                'nombre'              => $s->nombre,
                'descripcion'         => $s->descripcion,
                'estado'              => $s->estado,
                'tipo'                => $s->tipo,
                'imagen_hero'         => $s->imagen_hero,
                'banner_promocional'  => $s->banner_promocional,
                'fecha_inicio'        => $s->fecha_inicio,
                'fecha_fin'           => $s->fecha_fin,
                'precio_ticket'       => $s->precio_ticket,
                'cantidad_tickets'    => $s->cantidad_tickets,
                'premios'             => $s->premios->map(fn($p) => [
                    'id'          => $p->id,
                    'nombre'      => $p->nombre,
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
        $sorteos = \App\Models\Sorteo::with(['premios'])->withCount(['tickets as valid_tickets_count' => function($query) {
            $query->whereIn('estado', ['vendido', 'reservado']);
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

        // Extract Pending Purchases separately
        $pendientesQuery = \App\Models\Compra::with(['user:id,name,dni', 'sorteo:id,nombre'])
            ->where('estado', 'pendiente');

        if ($search) {
            $pendientesQuery->where(function($q) use ($search) {
                $cleanSearch = str_ireplace('COMPRA-', '', $search);

                $q->whereHas('user', function($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                       ->orWhere('dni', 'like', "%{$search}%");
                })
                ->orWhere('id', 'like', "%{$cleanSearch}%");
            });
        }

        $pendientesPaginated = $pendientesQuery->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'pend_page')
            ->withQueryString();

        $pendientesPaginated->getCollection()->transform(function ($c) {
                return [
                    'id'             => $c->id,
                    'user'           => $c->user?->name ?? $c->nombre ?? '—',
                    'user_dni'       => $c->user?->dni ?? $c->dni ?? '—',
                    'sorteo'         => $c->sorteo?->nombre ?? '—',
                    'fecha'          => $c->created_at->format('d M Y H:i'),
                    'total'          => $c->total,
                    'metodo_pago'    => strtoupper($c->metodo_pago ?? '—'),
                    'estado'         => $c->estado,
                    'comprobante_url'=> $c->comprobante ? asset('storage/'.$c->comprobante) : null,
                    'detalles'       => $c->detalles,
                ];
            });

        $query = \App\Models\Compra::with(['user', 'sorteo'])
            ->where('estado', '!=', 'pendiente')
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function($q) use ($search) {
                // Remove 'COMPRA-' prefix if user pasted it
                $cleanSearch = str_ireplace('COMPRA-', '', $search);

                $q->whereHas('user', function($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                       ->orWhere('dni', 'like', "%{$search}%");
                })
                ->orWhere('id', 'like', "%{$cleanSearch}%")
                ->orWhereJsonContains('detalles->numeros_manuales', $search);
            });
        }

        $comprasPaginated = $query->paginate($limit, ['*'], 'page')->withQueryString();
            
        $comprasPaginated->getCollection()->transform(function ($c) {
            return [
                'id'             => $c->id,
                'user'           => $c->user?->name ?? $c->nombre ?? '—',
                'user_dni'       => $c->user?->dni ?? $c->dni ?? '—',
                'sorteo'         => $c->sorteo?->nombre ?? '—',
                'fecha'          => $c->created_at->format('d M Y H:i'),
                'total'          => $c->total,
                'metodo_pago'    => strtoupper($c->metodo_pago ?? '—'),
                'estado'         => $c->estado,
                'comprobante_url'=> $c->comprobante ? asset('storage/'.$c->comprobante) : null,
                'detalles'       => $c->detalles,
            ];
        });

        $sorteos = \App\Models\Sorteo::select('id', 'nombre', 'cantidad_tickets', 'precio_ticket')
            ->whereIn('estado', ['activo', 'programado'])
            ->get();

        $ticketsData = []; // Removido para optimizar velocidad LCP. Se carga via API async en frontend.

        return Inertia::render('Admin/Tickets', [
            'comprasPaginated' => $comprasPaginated,
            'pendientesPaginated' => $pendientesPaginated,
            'sorteos'     => $sorteos,
            'ticketsData' => $ticketsData,
            'filters'     => ['perPage' => $perPage]
        ]);
    }

    public function usuarios(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $draw = $request->input('draw');
        $perPage = $request->input('perPage', 25);
        $limit = $perPage === 'todos' ? 999999 : (int) $perPage;

        $query = \App\Models\User::where('is_admin', false)
            ->where(function ($q) {
                $q->whereNull('email')
                  ->orWhere('email', 'not like', '%@offline.local')
                  ->where('email', 'not like', '%@sorteos.local');
            });

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%")
                  ->orWhere('telefono', 'like', "%{$search}%");
            });
        }

        if ($status && $status !== 'todos') {
            if ($status === 'activos') {
                $query->where('estado', 'activo')->orWhereNull('estado');
            } elseif ($status === 'baneados') {
                $query->where('estado', 'bloqueado');
            } elseif ($status === 'sin_compras') {
                $query->doesntHave('tickets');
            }
        }

        if ($draw && $draw !== 'todos') {
            $query->whereHas('tickets.sorteo', function($q) use ($draw) {
                $q->where('nombre', $draw);
            });
        }

        $adminUsersPaginated = $query->with(['tickets' => function($q) {
                $q->with('sorteo:id,nombre');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate($limit)->withQueryString();
            
        $adminUsersPaginated->getCollection()->transform(function ($u) {
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
            'adminUsersPaginated' => $adminUsersPaginated,
            'sorteosData'    => $sorteosList,
            'filters'        => ['perPage' => $perPage]
        ]);
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

    public function destroyUsuario($id)
    {
        $user = \App\Models\User::findOrFail($id);

        if ($user->is_admin) {
            return redirect()->back()->with('error', 'No puedes eliminar un administrador.');
        }

        $comprasActivas = \App\Models\Compra::where('user_id', $id)
            ->whereIn('estado', ['pendiente', 'aprobado'])
            ->count();

        if ($comprasActivas > 0) {
            return redirect()->back()->with('error', 'No puedes eliminar un usuario con compras activas o pendientes.');
        }

        $user->compras()->delete();
        $user->delete();

        return redirect()->back()->with('success', 'Usuario eliminado exitosamente.');
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
            'razon_social',  // razón social mostrada en la página de pago
        ];

        foreach ($allowed as $key) {
            if ($request->has($key)) {
                \App\Models\SiteSettings::set($key, $request->input($key));
            }
        }

        // Invalidar cache para que los cambios sean inmediatos en el frontend
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

        return response()->json(['url' => $url]);
    }

    public function apiTicketsStatus($sorteoId)
    {
        $nums = \App\Models\Ticket::where('sorteo_id', $sorteoId)
            ->whereIn('estado', ['vendido', 'reservado', 'impreso'])
            ->get(['numero', 'estado']);
        return response()->json($nums->pluck('estado', 'numero')->toArray());
    }

    public function apiDrawTicket(Request $request)
    {
        $sorteoId = $request->input('sorteo_id');
        $drawnNumbers = $request->input('drawn_numbers', []);

        $ticket = \App\Models\Ticket::where('sorteo_id', $sorteoId)
            ->whereIn('estado', ['vendido', 'reservado'])
            ->whereNotIn('numero', $drawnNumbers)
            ->with(['user:id,name', 'sorteo:id,nombre'])
            ->inRandomOrder()
            ->first();

        if (!$ticket) {
            return response()->json(['error' => 'No hay tickets válidos disponibles para sortear.'], 404);
        }

        return response()->json([
            'number' => $ticket->numero,
            'user' => $ticket->user ? $ticket->user->name : 'Usuario Anónimo',
            'draw' => $ticket->sorteo->nombre ?? 'Sorteo',
            'status' => $ticket->estado
        ]);
    }
}
