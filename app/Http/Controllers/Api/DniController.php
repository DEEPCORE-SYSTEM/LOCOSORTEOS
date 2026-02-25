<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DniController extends Controller
{
    /**
     * Consulta el DNI usando apis.net.pe
     */
    public function consultar(Request $request)
    {
        $request->validate([
            'dni' => 'required|string|size:8',
        ]);

        $dni = $request->input('dni');
        $token = env('APIS_NET_PE_TOKEN');

        if (!$token) {
            return response()->json(['error' => 'API Token no configurado en el servidor.'], 500);
        }

        try {
            $response = Http::withToken($token)
                ->get('https://api.apis.net.pe/v2/reniec/dni', [
                    'numero' => $dni
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                
                $nombreCompleto = trim($data['nombres'] . ' ' . $data['apellidoPaterno'] . ' ' . $data['apellidoMaterno']);

                return response()->json([
                    'success' => true,
                    'nombre' => $nombreCompleto
                ]);
            }

            return response()->json([
                'error' => 'No se encontró información o hubo un problema con la API.'
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al conectar con el servicio de consultas.'
            ], 500);
        }
    }
}
