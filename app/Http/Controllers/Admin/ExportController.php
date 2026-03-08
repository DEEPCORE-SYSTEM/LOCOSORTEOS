<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\Sorteo;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function exportarSorteo(Request $request)
    {
        $sorteo_id = $request->query('sorteo_id');
        
        if (!$sorteo_id) {
            return redirect()->back()->with('error', 'Debe seleccionar un sorteo para exportar.');
        }

        $sorteo = Sorteo::findOrFail($sorteo_id);

        
        $tickets = Ticket::with(['user:id,name'])
            ->where('sorteo_id', $sorteo_id)
            ->where('estado', 'vendido')
            ->orderBy('numero', 'asc')
            ->select('id', 'numero', 'user_id', 'sorteo_id')
            ->get();

        
        $chunks = $tickets->chunk(50);

        return view('pdf.tickets_export', [
            'sorteo' => $sorteo,
            'chunks' => $chunks,
        ]);
    }

    public function exportarCompras(Request $request): StreamedResponse
    {
        $search = trim((string) $request->query('search', ''));

        $query = Compra::with(['user', 'sorteo', 'tickets:id,numero'])
            ->where('estado', 'aprobado')
            ->orderBy('created_at', 'desc');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $cleanSearch = str_ireplace('COMPRA-', '', $search);

                $q->whereHas('user', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('dni', 'like', "%{$search}%");
                })
                ->orWhere('id', 'like', "%{$cleanSearch}%")
                ->orWhereJsonContains('detalles->numeros_manuales', $search);
            });
        }

        $filename = 'historial_ventas_' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Compra',
                'Cliente',
                'DNI',
                'Sorteo',
                'Tickets',
                'Total',
                'Metodo de pago',
                'Estado',
                'Fecha',
            ]);

            $query->chunk(500, function ($compras) use ($handle) {
                foreach ($compras as $compra) {
                    $detalles = $compra->detalles ?? [];
                    $ticketsRelacion = $compra->tickets->pluck('numero')->values()->all();
                    $ticketsDetalles = $detalles['tickets'] ?? $detalles['numeros_asignados'] ?? [];
                    $tickets = ! empty($ticketsRelacion) ? $ticketsRelacion : $ticketsDetalles;

                    fputcsv($handle, [
                        'COMPRA-' . $compra->id,
                        $compra->user?->name ?? $compra->nombre ?? '—',
                        $compra->user?->dni ?? $compra->dni ?? '—',
                        $compra->sorteo?->nombre ?? '—',
                        implode(', ', $tickets),
                        number_format((float) $compra->total, 2, '.', ''),
                        strtoupper((string) $compra->metodo_pago),
                        strtoupper((string) $compra->estado),
                        optional($compra->created_at)->format('Y-m-d H:i'),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
