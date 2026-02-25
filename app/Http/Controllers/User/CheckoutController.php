<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Compra;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'sorteo_id' => 'required|exists:sorteos,id',
            'cantidad' => 'required|integer|min:1',
            'numeros_seleccionados' => 'array',
            'modo_seleccion' => 'required|in:random,manual',
            'metodo_pago' => 'required|in:yape,plin,transferencia,efectivo',
            'comprobante' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'total' => 'required|numeric|min:0'
        ]);

        $path = null;
        if ($request->hasFile('comprobante')) {
            $path = $request->file('comprobante')->store('comprobantes', 'public');
        }

        $compra = Compra::create([
            'user_id' => $request->user()->id,
            'sorteo_id' => $request->sorteo_id,
            'total' => $request->total,
            'metodo_pago' => $request->metodo_pago,
            'comprobante' => $path,
            'estado' => 'pendiente',
            'detalles' => [
                'cantidad' => $request->cantidad,
                'modo_seleccion' => $request->modo_seleccion,
                'numeros_manuales' => $request->numeros_seleccionados
            ]
        ]);

        return redirect()->back()->with('success', '¡Comprobante enviado exitosamente! Validaremos tu pago en breve.');
    }
}
