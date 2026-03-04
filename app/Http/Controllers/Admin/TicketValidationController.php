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

        // Extract Pending Purchases separately, paginated
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

        $query = Compra::with(['user', 'sorteo'])
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

        $comprasPaginated = $query->paginate($limit, ['*'], 'hist_page')->withQueryString();
            
        $comprasPaginated->getCollection()->transform(function ($compra) {
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

        $sorteos = \App\Models\Sorteo::where('estado', 'activo')->get();

        $ticketsPorSorteo = [];
        foreach ($sorteos as $sorteo) {
            
            $tickets = \App\Models\Ticket::where('sorteo_id', $sorteo->id)
                ->pluck('estado', 'numero')
                ->toArray();
            
            
            $reservas = \App\Models\Compra::where('sorteo_id', $sorteo->id)
                ->where('estado', 'pendiente')
                ->get();
                
            foreach ($reservas as $reserva) {
                $manuales = $reserva->detalles['numeros_manuales'] ?? [];
                foreach ($manuales as $num) {
                    $numStr = str_pad($num, 3, '0', STR_PAD_LEFT); 
                    if (!isset($tickets[$numStr])) {
                        $tickets[$numStr] = 'reservado';
                    }
                }
            }
            $ticketsPorSorteo[$sorteo->id] = $tickets;
        }

        return Inertia::render('Admin/Tickets', [
            'comprasPaginated' => $comprasPaginated,
            'pendientesPaginated' => $pendientesPaginated,
            'sorteos' => $sorteos,
            'ticketsData' => $ticketsPorSorteo,
            'filters' => ['search' => $search, 'perPage' => $perPage]
        ]);
    }

    public function approve(Request $request, $id)
    {
        $compra = Compra::findOrFail($id);

        if ($compra->estado !== 'pendiente') {
            return redirect()->back()->with('error', 'Esta compra ya fue procesada.');
        }

        DB::transaction(function () use ($compra) {
            $compra->update(['estado' => 'aprobado']);
            
            $cantidad = $compra->detalles['cantidad'] ?? 1;
            $modo = $compra->detalles['modo_seleccion'] ?? 'random';
            $numerosManuales = $compra->detalles['numeros_manuales'] ?? [];

            
            $ticketsOcupados = Ticket::where('sorteo_id', $compra->sorteo_id)->pluck('numero')->toArray();

            $nuevosTickets = [];

            if ($modo === 'manual' && count($numerosManuales) == $cantidad) {
                
                foreach ($numerosManuales as $num) {
                    if (!in_array($num, $ticketsOcupados)) {
                         $nuevosTickets[] = $num;
                    } else {
                         
                         $nuevosTickets[] = $this->generarNumeroLibre($ticketsOcupados, $compra->sorteo_id);
                         $ticketsOcupados[] = end($nuevosTickets); 
                    }
                }
            } else {
                
                for ($i = 0; $i < $cantidad; $i++) {
                    $num = $this->generarNumeroLibre($ticketsOcupados, $compra->sorteo_id);
                    $nuevosTickets[] = $num;
                    $ticketsOcupados[] = $num;
                }
            }

            
            foreach ($nuevosTickets as $numStr) {
                Ticket::create([
                    'sorteo_id' => $compra->sorteo_id,
                    'numero' => str_pad($numStr, 3, '0', STR_PAD_LEFT),
                    'estado' => 'vendido',
                    'user_id' => $compra->user_id,
                    'fecha_venta' => now()
                ]);
            }
        });

        return redirect()->back()->with('success', 'Pago aprobado y tickets generados exitosamente.');
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

            // Update user details if they existed but had placeholder/old data
            // (Optional, but good for keeping contact info fresh)
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
                ]
            ]);

            
            $ticketsOcupados = Ticket::where('sorteo_id', $compra->sorteo_id)->pluck('numero')->toArray();

            if ($modo === 'manual' && count($numerosManuales) > 0) {
                foreach ($numerosManuales as $num) {
                    $numPad = str_pad($num, 3, '0', STR_PAD_LEFT);
                    
                    if (in_array($numPad, $ticketsOcupados)) {
                        $ticketExistente = Ticket::where('sorteo_id', $compra->sorteo_id)->where('numero', $numPad)->first();
                        if ($ticketExistente && in_array($ticketExistente->estado, ['vendido', 'reservado'])) {
                             abort(422, "El ticket {$numPad} ya no está disponible.");
                        }
                    }

                    Ticket::updateOrCreate(
                        [
                            'sorteo_id' => $compra->sorteo_id, 
                            'numero' => $numPad
                        ],
                        [
                            'estado' => 'vendido',
                            'user_id' => $compra->user_id,
                            'fecha_venta' => now()
                        ]
                    );
                }
            } else {
                for ($i = 0; $i < $request->cantidad; $i++) {
                    $numStr = $this->generarNumeroLibre($ticketsOcupados, $compra->sorteo_id);
                    Ticket::create([
                        'sorteo_id' => $compra->sorteo_id,
                        'numero' => str_pad($numStr, 3, '0', STR_PAD_LEFT),
                        'estado' => 'vendido',
                        'user_id' => $compra->user_id,
                        'fecha_venta' => now()
                    ]);
                    $ticketsOcupados[] = $numStr;
                }
            }
        });

        return redirect()->back()->with('success', 'Venta offline registrada y tickets generados exitosamente.');
    }

    private function generarNumeroLibre($ocupados, $sorteo_id)
    {
        // Obtener el límite real del sorteo
        $sorteo = \App\Models\Sorteo::find($sorteo_id);
        $max = $sorteo ? min((int)$sorteo->cantidad_tickets, 9999) : 999;
        $padLen = strlen((string)$max); // 3 para <=999, 4 para >999

        for ($i = 0; $i < 2000; $i++) {
            $num = rand(1, $max);
            $candidato = str_pad($num, $padLen, '0', STR_PAD_LEFT);
            if (!in_array($candidato, $ocupados) && !in_array($num, $ocupados)) {
                return $candidato;
            }
        }

        // Si después de 2000 intentos no hay espacio, abortar con mensaje claro
        abort(422, "El sorteo está lleno. No quedan números disponibles.");
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

        $padLen = strlen((string)min($sorteo->cantidad_tickets, 9999));
        $padLen = max($padLen, 3); // Mínimo 3 dígitos
        
        $numerosRequeridos = [];
        for ($i = $desde; $i <= $hasta; $i++) {
            $numerosRequeridos[] = str_pad($i, $padLen, '0', STR_PAD_LEFT);
        }

        // Verificar si algún boleto en el rango ya está ocupado (vendido, reservado, impreso)
        $ocupados = Ticket::where('sorteo_id', $sorteo->id)
            ->whereIn('numero', $numerosRequeridos)
            ->pluck('numero')->toArray();

        if (count($ocupados) > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'El rango seleccionado contiene tickets que ya no están libres: ' . end($ocupados)
            ], 422);
        }

        // Generar lote de impresión (bloquea los tickets como 'impreso')
        DB::transaction(function () use ($sorteo, $numerosRequeridos, $request) {
            $adminUserId = auth()->id() ?? 1; // Asignamos al generador (vendedor de origen genérico o null si refactorizamos bd)
            
            // Creamos un dummy user o asignamos a un usuario "Impresión Física" 
            $userOffline = \App\Models\User::firstOrCreate(
                ['email' => 'impresion_' . $sorteo->id . '@sorteos.local'],
                [
                    'name' => 'Lote Impreso ' . ($request->vendedor ? '(' . $request->vendedor . ')' : ''),
                    'dni' => '00000000',
                    'password' => bcrypt('impresion_lote'),
                    'telefono' => '000000000',
                    'is_admin' => false
                ]
            );

            // Generamos los tickets marcados como impreso (en calle)
            $ticketsData = [];
            $now = now();
            foreach ($numerosRequeridos as $numStr) {
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
            
            // Inserción batch para rendimiento
            $chunks = array_chunk($ticketsData, 500);
            foreach ($chunks as $chunk) {
                Ticket::insert($chunk);
            }
        });

        if ($request->formato === 'excel') {
            $filename = "Talonario_{$sorteo->id}_{$desde}_{$hasta}.xlsx";
            $filePath = "exports/{$filename}";
            
            // Cola y Chunking configurados en la clase Export
            (new \App\Exports\TicketsExport($sorteo->id, $numerosRequeridos))->queue($filePath, 'public');
            
            return response()->json([
                'status' => 'queued',
                'message' => 'Exportación de Excel iniciada en segundo plano. El archivo estará listo en breve.',
                'url' => asset("storage/{$filePath}")
            ]);
        }

        // Crear y guardar PDF con Spatie en el disco público
        $pdfFilename = "Talonario_{$sorteo->id}_{$desde}_{$hasta}.pdf";
        $pdfRelativePath = "exports/{$pdfFilename}";

        $pdf = \Spatie\LaravelPdf\Facades\Pdf::view('pdf.tickets', [
                'sorteo' => $sorteo,
                'numeros' => $numerosRequeridos,
                'vendedor' => $request->vendedor
            ])
            ->format('A4');

        // Guardar el archivo en storage/app/public/exports
        $pdf->save(storage_path("app/public/{$pdfRelativePath}"));

        // Devolver la URL pública del PDF
        return response()->json([
            'status' => 'success',
            'url' => asset("storage/{$pdfRelativePath}")
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
        $compra = Compra::findOrFail($id);

        DB::transaction(function () use ($compra) {
            // Free the tickets associated with this purchase.
            // Since there is no `compra_id` on tickets, we match by user, sorteo, and close timestamp.
            Ticket::where('sorteo_id', $compra->sorteo_id)
                ->where('user_id', $compra->user_id)
                ->whereBetween('fecha_venta', [
                    $compra->created_at->copy()->subMinutes(5), 
                    $compra->created_at->copy()->addMinutes(5)
                ])
                ->delete();

            $compra->delete();
        });

        return redirect()->back()->with('success', 'Venta anulada. Los tickets han vuelto a estar libres.');
    }
}
