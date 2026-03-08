<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Compra;
use App\Models\Ticket;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TicketValidationController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('perPage', 25);
        $limit = $perPage === 'todos' ? 999999 : (int) $perPage;

        
        $pendientesQuery = Compra::with(['user', 'sorteo'])
            ->where('estado', 'pendiente')
            ->orderBy('created_at', 'desc');

        if ($search) {
            $pendientesQuery->where(function($q) use ($search) {
                $cleanSearch = str_ireplace('COMPRA-', '', $search);

                $q->whereHas('user', function($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                       ->orWhere('dni', 'like', "%{$search}%");
                })
                ->orWhere('id', 'like', "%{$cleanSearch}%")
                ->orWhereJsonContains('detalles->numeros_manuales', $search);
            });
        }

        $pendientesPaginated = $pendientesQuery->paginate($limit, ['*'], 'pend_page')->withQueryString();

        $pendientesPaginated->getCollection()->transform(function ($compra) {
            return [
                'id' => $compra->id,
                'user' => $compra->user?->name ?? $compra->nombre ?? '—',
                'user_dni' => $compra->user?->dni ?? $compra->dni ?? '—',
                'sorteo' => $compra->sorteo?->nombre ?? '—',
                'total' => $compra->total,
                'metodo_pago' => strtoupper($compra->metodo_pago ?? '—'),
                'estado' => $compra->estado,
                'fecha' => $compra->created_at->format('Y-m-d H:i'),
                'comprobante_url' => $compra->comprobante ? asset('storage/' . $compra->comprobante) : null,
                'detalles' => $compra->detalles
            ];
        });

        $query = Compra::with(['user', 'sorteo', 'tickets:id,numero'])
            ->where('estado', '!=', 'pendiente')
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function($q) use ($search) {
                $cleanSearch = str_ireplace('COMPRA-', '', $search);

                $q->whereHas('user', function($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                       ->orWhere('dni', 'like', "%{$search}%");
                })
                ->orWhere('id', 'like', "%{$cleanSearch}%")
                ->orWhereJsonContains('detalles->numeros_manuales', $search);
            });
        }

        $comprasPaginated = $query->paginate($limit, ['*'], 'hist_page')->withQueryString();
            
        $comprasPaginated->getCollection()->transform(function ($compra) {
            $detalles = $compra->detalles;
            if (!isset($detalles['tickets']) && isset($detalles['numeros_asignados'])) {
                $detalles['tickets'] = $detalles['numeros_asignados'];
            }
            if (!isset($detalles['tickets']) || empty($detalles['tickets'])) {
                $detalles['tickets'] = $compra->tickets->pluck('numero')->toArray();
            }

            return [
                'id' => $compra->id,
                'user' => $compra->user?->name ?? $compra->nombre ?? '—',
                'user_dni' => $compra->user?->dni ?? $compra->dni ?? '—',
                'sorteo' => $compra->sorteo?->nombre ?? '—',
                'total' => $compra->total,
                'metodo_pago' => strtoupper($compra->metodo_pago ?? '—'),
                'estado' => $compra->estado,
                'fecha' => $compra->created_at->format('Y-m-d H:i'),
                'comprobante_url' => $compra->comprobante ? asset('storage/' . $compra->comprobante) : null,
                'detalles' => $detalles
            ];
        });

        $sorteos = \App\Models\Sorteo::where('estado', 'activo')->get();

        return Inertia::render('Admin/Tickets', [
            'comprasPaginated' => $comprasPaginated,
            'pendientesPaginated' => $pendientesPaginated,
            'sorteos' => $sorteos,
            'ticketsData' => [],
            'filters' => ['search' => $search, 'perPage' => $perPage]
        ]);
    }

    public function approve(Request $request, $id)
    {
        $result = DB::transaction(function () use ($id) {
            $compra = Compra::whereKey($id)->lockForUpdate()->firstOrFail();

            if ($compra->estado !== 'pendiente') {
                return ['ok' => false, 'message' => 'Esta compra ya fue procesada.'];
            }

            $cantidad = (int) ($compra->detalles['cantidad'] ?? 1);
            $modo = $compra->detalles['modo_seleccion'] ?? 'random';
            $numerosManuales = array_values(array_unique(array_map('strval', (array) ($compra->detalles['numeros_manuales'] ?? []))));
            $sorteo = \App\Models\Sorteo::find($compra->sorteo_id);

            $numerosAsignados = [];
            $ticketIds = [];

            if ($modo === 'manual' && count($numerosManuales) === $cantidad) {
                foreach ($numerosManuales as $num) {
                    $numFormateado = $this->formatearNumeroTicket($num, $sorteo);

                    $ticket = Ticket::where('sorteo_id', $compra->sorteo_id)
                        ->where('numero', $numFormateado)
                        ->whereIn('estado', ['disponible', 'reservado'])
                        ->lockForUpdate()
                        ->first();

                    if (! $ticket) {
                        $ticket = Ticket::where('sorteo_id', $compra->sorteo_id)
                            ->where('estado', 'disponible')
                            ->orderBy('id')
                            ->lockForUpdate()
                            ->first();

                        if (! $ticket) {
                            abort(422, 'El sorteo esta lleno. No quedan tickets disponibles.');
                        }
                    }

                    $ticket->update([
                        'estado' => 'vendido',
                        'user_id' => $compra->user_id,
                        'fecha_venta' => now(),
                    ]);

                    $numerosAsignados[] = $ticket->numero;
                    $ticketIds[] = $ticket->id;
                }
            } else {
                for ($i = 0; $i < $cantidad; $i++) {
                    $ticket = Ticket::where('sorteo_id', $compra->sorteo_id)
                        ->where('estado', 'disponible')
                        ->orderBy('id')
                        ->lockForUpdate()
                        ->first();

                    if (! $ticket) {
                        abort(422, 'El sorteo esta lleno. No quedan tickets disponibles.');
                    }

                    $ticket->update([
                        'estado' => 'vendido',
                        'user_id' => $compra->user_id,
                        'fecha_venta' => now(),
                    ]);

                    $numerosAsignados[] = $ticket->numero;
                    $ticketIds[] = $ticket->id;
                }
            }

            $compra->tickets()->syncWithoutDetaching($ticketIds);

            $detalles = $compra->detalles ?? [];
            $detalles['tickets'] = $numerosAsignados;

            $compra->update([
                'estado' => 'aprobado',
                'detalles' => $detalles,
            ]);

            return ['ok' => true];
        });

        if (! $result['ok']) {
            return redirect()->back()->with('error', $result['message']);
        }

        return redirect()->back()->with('success', 'Pago aprobado y tickets asignados exitosamente.');
    }

    public function reject(Request $request, $id)
    {
        $request->validate(['motivo' => 'nullable|string|max:255']);
        $compra = Compra::findOrFail($id);
        
        if ($compra->estado !== 'pendiente') {
            return redirect()->back()->with('error', 'Esta compra ya fue procesada.');
        }

        $compra->update([
            'estado' => 'rechazado',
            'motivo_rechazo' => $request->motivo ?? 'Comprobante inválido o monto incorrecto'
        ]);

        return redirect()->back()->with('success', 'Pago rechazado correctamente.');
    }

    public function storeOffline(Request $request)
    {
        $request->validate([
            'sorteo_id' => 'required|exists:sorteos,id',
            'dni' => 'required|digits:8',
            'nombre' => 'required|string|max:255',
            'telefono' => 'required|string|max:20',
            'departamento' => 'nullable|string|max:255',
            'provincia_distrito' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'medio_pago_fisico' => 'required|string|max:255',
            'quien_realizo' => 'required|string|max:255',
            'cantidad' => 'required|integer|min:1',
            'total' => 'required|numeric|min:0',
            'modo_seleccion' => 'nullable|in:random,manual',
            'numeros_manuales' => 'nullable|array',
            'numeros_manuales.*' => 'string'
        ]);

        DB::transaction(function () use ($request) {
            
            $user = \App\Models\User::firstOrCreate(
                ['dni' => $request->dni],
                [
                    'name' => $request->nombre,
                    'email' => $request->dni . '@offline.local', 
                    'password' => bcrypt($request->dni), 
                    'telefono' => $request->telefono,
                    'is_admin' => false
                ]
            );

            
            
            if ($user->telefono == '000000000' || $user->telefono == '-') {
                $user->update(['telefono' => $request->telefono, 'name' => $request->nombre]);
            }

            
            $modo = $request->modo_seleccion ?? 'random';
            $numerosManuales = $request->numeros_manuales ?? [];

            $compra = Compra::create([
                'user_id' => $user->id,
                'sorteo_id' => $request->sorteo_id,
                'total' => $request->total,
                'metodo_pago' => $request->medio_pago_fisico,
                'comprobante' => null,
                'estado' => 'aprobado', 
                'registrado_por' => auth()->id(), 
                'detalles' => [
                    'cantidad' => $request->cantidad,
                    'modo_seleccion' => $modo,
                    'numeros_manuales' => $numerosManuales,
                    'tipo_venta' => 'Talonario Físico',
                    'departamento' => $request->departamento,
                    'provincia_distrito' => $request->provincia_distrito,
                    'direccion' => $request->direccion,
                    'quien_realizo' => $request->quien_realizo,
                    'tickets' => [], // Inicializar para llenar abajo
                ]
            ]);

            $numerosAsignados = [];
            $ticketIds        = [];

            // Only track genuinely occupied tickets to prevent memory explosion with pre-seeded 'disponible' rows
            $ticketsOcupados = Ticket::where('sorteo_id', $compra->sorteo_id)
                ->whereIn('estado', ['vendido', 'reservado', 'impreso'])
                ->pluck('numero')->toArray();
            $sorteo = \App\Models\Sorteo::find($compra->sorteo_id);

            if ($modo === 'manual' && count($numerosManuales) > 0) {
                foreach ($numerosManuales as $num) {
                    // Acepta tanto número puro como código con prefijo
                    $numFormatado = $this->formatearNumeroTicket($num, $sorteo);

                    if (in_array($numFormatado, $ticketsOcupados)) {
                        $ticketExistente = Ticket::where('sorteo_id', $compra->sorteo_id)->where('numero', $numFormatado)->first();
                        if ($ticketExistente && in_array($ticketExistente->estado, ['vendido', 'reservado'])) {
                             abort(422, "El ticket {$numFormatado} ya no está disponible.");
                        }
                    }

                    $ticket = Ticket::updateOrCreate(
                        [
                            'sorteo_id' => $compra->sorteo_id,
                            'numero' => $numFormatado
                        ],
                        [
                            'estado' => 'vendido',
                            'user_id' => $compra->user_id,
                            'fecha_venta' => now()
                        ]
                    );

                    $numerosAsignados[] = $ticket->numero;
                    $ticketIds[]        = $ticket->id;
                }
            } else {
                for ($i = 0; $i < $request->cantidad; $i++) {
                    $numStr = $this->generarNumeroLibre($ticketsOcupados, $compra->sorteo_id);
                    $ticket = Ticket::create([
                        'sorteo_id' => $compra->sorteo_id,
                        'numero' => $numStr, // ya formateado por generarNumeroLibre
                        'estado' => 'vendido',
                        'user_id' => $compra->user_id,
                        'fecha_venta' => now()
                    ]);

                    $numerosAsignados[] = $ticket->numero;
                    $ticketIds[]        = $ticket->id;
                    $ticketsOcupados[]  = $numStr;
                }
            }

            // Vincular tickets a la compra y actualizar detalles
            $compra->tickets()->attach($ticketIds);
            
            $detalles = $compra->detalles;
            $detalles['tickets'] = $numerosAsignados;
            $compra->update(['detalles' => $detalles]);
        });

        return redirect()->back()->with('success', 'Venta offline registrada y tickets generados exitosamente.');
    }

    private function generarNumeroLibre($ocupados, $sorteo_id)
    {
        $sorteo = \App\Models\Sorteo::find($sorteo_id);
        $max = $sorteo ? (int)$sorteo->cantidad_tickets : 999;

        for ($i = 0; $i < 2000; $i++) {
            $num = rand(1, $max);
            $candidato = $this->formatearNumeroTicket($num, $sorteo);
            if (!in_array($candidato, $ocupados)) {
                return $candidato;
            }
        }

        abort(422, 'El sorteo está lleno. No quedan números disponibles.');
    }

    /**
     * Formatea un número de ticket aplicando el prefijo y los dígitos configurados en el sorteo.
     * Ejemplo: formatearNumeroTicket(1, $sorteo con prefijo="CD-" digitos=5) → "CD-00001"
     * Si el valor ya contiene letras/guión (es alfanumérico), lo retorna tal cual.
     */
    private function formatearNumeroTicket($numero, $sorteo): string
    {
        // Si ya tiene formato alfanumérico no numérico puro, devolver tal cual
        if (!is_numeric(str_replace(['-', ' ', '_'], '', $numero)) === false && preg_match('/[a-zA-Z]/', (string)$numero)) {
            return (string)$numero;
        }

        $digitos = $sorteo?->digitos_ticket ?? 3;
        $prefijo = $sorteo?->prefijo_ticket ?? '';

        // Extrae solo los dígitos si el número ya tiene prefijo pegado
        $soloNumero = preg_replace('/[^0-9]/', '', (string)$numero);
        $numeroPadded = str_pad((int)$soloNumero, $digitos, '0', STR_PAD_LEFT);

        return $prefijo . $numeroPadded;
    }

    public function exportPdf(Request $request)
    {
        $request->validate([
            'sorteo_id' => 'required|exists:sorteos,id',
            'desde' => 'required|integer|min:0',
            'hasta' => 'required|integer|min:0|gte:desde',
            'vendedor' => 'nullable|string|max:255',
            'formato' => 'required|in:pdf,excel'
        ]);

        $sorteo = \App\Models\Sorteo::findOrFail($request->sorteo_id);
        
        $desde = $request->desde;
        $hasta = $request->hasta;
        $cantidad = $hasta - $desde + 1;

        if ($cantidad > 1000) {
            return response()->json([
                'status' => 'error',
                'message' => 'No puedes imprimir más de 1000 tickets a la vez.'
            ], 422);
        }

        $numerosRequeridos = [];
        for ($i = $desde; $i <= $hasta; $i++) {
            $numerosRequeridos[] = $this->formatearNumeroTicket($i, $sorteo);
        }

        
        $ocupados = Ticket::where('sorteo_id', $sorteo->id)
            ->whereIn('numero', $numerosRequeridos)
            ->whereIn('estado', ['vendido', 'reservado', 'impreso'])
            ->pluck('numero')->toArray();

        if (count($ocupados) > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'El rango seleccionado contiene tickets que ya no están libres: ' . end($ocupados)
            ], 422);
        }

        DB::transaction(function () use ($sorteo, $numerosRequeridos, $request) {
            $adminUserId = auth()->id() ?? 1; 
            
            $userOffline = \App\Models\User::firstOrCreate(
                ['email' => 'impresion_' . $sorteo->id . '@sorteos.local'],
                [
                    'name' => 'Lote Impreso ' . ($request->vendedor ? '(' . $request->vendedor . ')' : ''),
                    'dni' => str_pad($sorteo->id, 8, '0', STR_PAD_LEFT), 
                    'password' => bcrypt('impresion_lote'),
                    'telefono' => '000000000',
                    'is_admin' => false
                ]
            );

            // Fetch exactly which ones already exist in the DB (like 'disponible' ones)
            $existentes = Ticket::where('sorteo_id', $sorteo->id)
                ->whereIn('numero', $numerosRequeridos)
                ->pluck('numero')->toArray();

            $porCrear = array_diff($numerosRequeridos, $existentes);
            $now = now();

            // 1. Update existing 'disponible' tickets
            if (count($existentes) > 0) {
                Ticket::where('sorteo_id', $sorteo->id)
                    ->whereIn('numero', $existentes)
                    ->update([
                        'estado' => 'impreso',
                        'user_id' => $userOffline->id,
                        'fecha_venta' => $now,
                        'updated_at' => $now
                    ]);
            }

            // 2. Insert new tickets that weren't in the DB at all
            if (count($porCrear) > 0) {
                $ticketsData = [];
                foreach ($porCrear as $numStr) {
                    $ticketsData[] = [
                        'sorteo_id' => $sorteo->id,
                        'numero' => $numStr,
                        'estado' => 'impreso',
                        'user_id' => $userOffline->id,
                        'fecha_venta' => $now,
                        'created_at' => $now,
                        'updated_at' => $now
                    ];
                }
                
                $chunks = array_chunk($ticketsData, 500);
                foreach ($chunks as $chunk) {
                    Ticket::insert($chunk);
                }
            }
        });

        if ($request->formato === 'excel') {
            $filename = "Talonario_{$sorteo->id}_{$desde}_{$hasta}.xlsx";
            $filePath = "exports/{$filename}";
            
            
            (new \App\Exports\TicketsExport($sorteo->id, $numerosRequeridos))->queue($filePath, 'public');
            
            return response()->json([
                'status' => 'queued',
                'message' => 'Exportación de Excel iniciada en segundo plano. El archivo estará listo en breve.',
                'url' => "/storage/{$filePath}"
            ]);
        }

        
        $pdfFilename = "Talonario_{$sorteo->id}_{$desde}_{$hasta}.pdf";
        $pdfRelativePath = "exports/{$pdfFilename}";

        $publicExportPath = public_path("storage/exports");
        if (!file_exists($publicExportPath)) {
            mkdir($publicExportPath, 0755, true);
        }

        // 16 tickets por hoja (2x8)
        $numChunks = array_chunk($numerosRequeridos, 16);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.tickets', [
                'sorteo' => $sorteo,
                'chunks' => $numChunks,
                'vendedor' => $request->vendedor
            ])
            ->setPaper('a4', 'portrait')
            ->setOption('isRemoteEnabled', true);

        
        $pdf->save($publicExportPath . '/' . $pdfFilename);

        
        return response()->json([
            'status' => 'success',
            'url' => "/storage/{$pdfRelativePath}"
        ]);
    }

    public function updateCompra(Request $request, $id)
    {
        $compra = Compra::findOrFail($id);
        
        $request->validate([
            'user' => 'required|string|max:255',
            'user_dni' => 'required|digits:8',
            'metodo_pago' => 'required|string|max:255',
        ]);

        if ($compra->user) {
            $compra->user->update([
                'name' => $request->user,
                'dni' => $request->user_dni
            ]);
        }

        $compra->update([
            'metodo_pago' => $request->metodo_pago,
        ]);

        return redirect()->back()->with('success', 'Venta actualizada correctamente.');
    }

    public function destroyCompra($id)
    {
        DB::transaction(function () use ($id) {
            $compra = Compra::with('tickets:id')
                ->whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            $ticketIds = $compra->tickets->pluck('id')->all();

            if (! empty($ticketIds)) {
                Ticket::whereIn('id', $ticketIds)
                    ->lockForUpdate()
                    ->update([
                        'estado' => 'disponible',
                        'user_id' => null,
                        'fecha_venta' => null,
                        'updated_at' => now(),
                    ]);

                $compra->tickets()->detach();
            } else {
                // Fallback para compras historicas sin relacion en pivote.
                Ticket::where('sorteo_id', $compra->sorteo_id)
                    ->where('user_id', $compra->user_id)
                    ->whereBetween('fecha_venta', [
                        $compra->created_at->copy()->subMinutes(5),
                        $compra->created_at->copy()->addMinutes(5),
                    ])
                    ->whereIn('estado', ['vendido', 'reservado'])
                    ->update([
                        'estado' => 'disponible',
                        'user_id' => null,
                        'fecha_venta' => null,
                        'updated_at' => now(),
                    ]);
            }

            $compra->delete();
        });

        return redirect()->back()->with('success', 'Venta anulada. Los tickets han vuelto a estar libres.');
    }
}
