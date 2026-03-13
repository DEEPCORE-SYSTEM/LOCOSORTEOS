<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Compra;
use App\Models\Participante;
use App\Models\Sorteo;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    private function formatTransactionId(int $id): string
    {
        return 'TX-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sorteo_id' => 'required|exists:sorteos,id',
            'cantidad' => 'required|integer|min:1',
            'numeros_seleccionados' => 'array',
            'modo_seleccion' => 'required|in:random,manual',
            'metodo_pago' => 'required|in:yape,plin,transferencia,efectivo',
            'comprobante' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'total' => 'required|numeric|min:0',
            'buyer_dni' => 'required|digits:8',
            'buyer_name' => 'required|string|max:255',
            'buyer_telefono' => 'required|string|max:20',
            'buyer_departamento' => 'required|string|max:100',
            'accept_terms' => 'accepted',
        ]);

        $sorteo = Sorteo::find($validated['sorteo_id']);
        if (! $sorteo || $sorteo->estado !== 'activo' || ! $sorteo->fecha_fin || $sorteo->fecha_fin->lte(now())) {
            throw ValidationException::withMessages([
                'sorteo_id' => 'Este sorteo ya cerró o no está disponible para compras.',
            ]);
        }

        $path = null;
        if ($request->hasFile('comprobante')) {
            $path = $request->file('comprobante')->store('comprobantes', 'public');
        }

        $dni = (string) $validated['buyer_dni'];

        $participante = Participante::where('dni', $dni)->first();
        if ($participante && $participante->estado === 'bloqueado') {
            abort(403, 'Tu cuenta está bloqueada.');
        }

        if (! $participante) {
            $participante = Participante::create([
                'dni' => $dni,
                'name' => $validated['buyer_name'],
                'telefono' => $validated['buyer_telefono'],
                'departamento' => $validated['buyer_departamento'],
                'estado' => 'activo',
            ]);
        } else {
            $participante->update([
                'name' => $validated['buyer_name'],
                'telefono' => $validated['buyer_telefono'],
                'departamento' => $validated['buyer_departamento'],
            ]);
        }

        $compra = Compra::create([
            'participant_id' => $participante->id,
            'sorteo_id' => $validated['sorteo_id'],
            'total' => $validated['total'],
            'metodo_pago' => $validated['metodo_pago'],
            'comprobante' => $path,
            'estado' => 'pendiente',
            'detalles' => [
                'cantidad' => $validated['cantidad'],
                'modo_seleccion' => $validated['modo_seleccion'],
                'numeros_manuales' => $validated['numeros_seleccionados'] ?? [],
                'tipo_venta' => 'Web',
                'buyer' => [
                    'dni' => $validated['buyer_dni'],
                    'name' => $validated['buyer_name'],
                    'telefono' => $validated['buyer_telefono'],
                    'departamento' => $validated['buyer_departamento'],
                ],
            ]
        ]);

        $requestedNumbers = array_values(array_filter(array_map('strval', (array) ($validated['numeros_seleccionados'] ?? []))));

        $message = 'Compra registrada correctamente. Codigo: ' . $this->formatTransactionId($compra->id) . '. Estado: Pendiente de validacion.';

        if (($validated['modo_seleccion'] ?? 'random') === 'manual' && ! empty($requestedNumbers)) {
            $message .= ' Numeros solicitados: ' . implode(', ', $requestedNumbers) . '.';
        } else {
            $message .= ' Tus numeros se asignaran cuando validemos el pago.';
        }

        return redirect()
            ->route('mis_tickets', ['dni' => $dni])
            ->with('success', $message);
    }
}
