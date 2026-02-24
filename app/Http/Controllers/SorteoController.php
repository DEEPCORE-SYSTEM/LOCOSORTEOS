<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sorteo;
use App\Jobs\GenerarTicketsJob;
use Inertia\Inertia;

class SorteoController extends Controller
{
    public function store(Request $request)
{
    $sorteo = Sorteo::create([
        'nombre' => $request->nombre,
        'descripcion' => $request->descripcion,
        'fecha_inicio' => $request->fecha_inicio,
        'fecha_fin' => $request->fecha_fin,
        'cantidad_tickets' => $request->cantidad_tickets,
        'precio_ticket' => $request->precio_ticket,
        'estado' => 'programado',
        'user_id' => auth()->id()
    ]);

    // 🔥 Esto dispara la generación automática
    GenerarTicketsJob::dispatch($sorteo);

    return back()->with('success', 'Sorteo creado y tickets generándose.');
    }

    public function index()
    {
        return Inertia::render('Sorteos/Index', [
            'sorteos' => \App\Models\Sorteo::all()
        ]);
    }
    public function show($id)
{
    $sorteo = \App\Models\Sorteo::findOrFail($id);

    return Inertia::render('Sorteos/Show', [
        'sorteo' => $sorteo,
        'tickets' => $sorteo->tickets()->select('id','numero','estado')->get()
    ]);
}

}
