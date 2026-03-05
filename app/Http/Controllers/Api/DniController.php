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
