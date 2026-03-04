<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sorteo;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function exportarSorteo(Request $request)
    {
        $sorteo_id = $request->query('sorteo_id');
        
        if (!$sorteo_id) {
            return redirect()->back()->with('error', 'Debe seleccionar un sorteo para exportar.');
        }

        $sorteo = Sorteo::findOrFail($sorteo_id);

        // Fetch valid tickets (vendidos) - Optimized query
        $tickets = Ticket::with(['user:id,name'])
            ->where('sorteo_id', $sorteo_id)
            ->where('estado', 'vendido')
            ->orderBy('numero', 'asc')
            ->select('id', 'numero', 'user_id', 'sorteo_id')
            ->get();

        // Dividir tickets en páginas de 50 tickets por página (grilla alta densidad 10x5)
        $chunks = $tickets->chunk(50);

        return view('pdf.tickets_export', [
            'sorteo' => $sorteo,
            'chunks' => $chunks,
        ]);
    }
}
