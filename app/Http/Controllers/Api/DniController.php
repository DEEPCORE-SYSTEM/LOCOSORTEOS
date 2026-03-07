<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DniController extends Controller
{
    /**
     * Consulta el DNI usando api.decolecta.com (RENIEC)
     */
    public function consultar(Request $request)
    {
        $request->validate([
            'dni' => 'required|string|size:8',
        ]);

        $dni   = $request->input('dni');

        // 1. Verificar primero en la base de datos local
        $userLocal = \App\Models\User::where('dni', $dni)->first();
        if ($userLocal) {
            $ultimaCompra = \App\Models\Compra::where('user_id', $userLocal->id)->latest()->first();
            $provinciaDistrito = $ultimaCompra->detalles['provincia_distrito'] ?? '';

            return response()->json([
                'success' => true,
                'nombre'  => $userLocal->name,
                'telefono' => $userLocal->telefono !== '000000000' && $userLocal->telefono !== '-' ? $userLocal->telefono : '',
                'departamento' => $userLocal->departamento ?? '',
                'direccion' => $userLocal->direccion ?? '',
                'provincia_distrito' => $provinciaDistrito,
                'source'  => 'local'
            ]);
        }

        // 2. Si no existe, proceder con la consulta a RENIEC
        $token = env('DECOLECTA_API_KEY');

        if (!$token) {
            return response()->json(['error' => 'API Key no configurada en el servidor.'], 500);
        }

        try {
            $response = Http::withToken($token)
                ->withoutVerifying()
                ->get('https://api.decolecta.com/v1/reniec/dni', [
                    'numero' => $dni,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                
                $nombreCompleto = $data['full_name']
                    ?? trim(($data['first_name'] ?? '') . ' ' . ($data['first_last_name'] ?? '') . ' ' . ($data['second_last_name'] ?? ''));

                return response()->json([
                    'success' => true,
                    'nombre'  => $nombreCompleto,
                    'telefono' => '',
                    'departamento' => '',
                    'direccion' => '',
                    'provincia_distrito' => '',
                    'source'  => 'api'
                ]);
            }

            return response()->json([
                'error' => 'No se encontró información para ese DNI.',
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al conectar con el servicio de consultas: ' . $e->getMessage(),
            ], 500);
        }
    }
}
