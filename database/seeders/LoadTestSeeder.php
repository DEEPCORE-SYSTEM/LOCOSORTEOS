<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LoadTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Empezando el sembrado masivo de datos para Load Testing...');

        // 1. Crear 100 Sorteos
        $this->command->info('Creando 100 sorteos con 10 premios cada uno...');
        $sorteosToInsert = [];
        $now = now();
        $adminId = DB::table('users')->where('is_admin', true)->value('id') ?? 1;

        $premiosToInsert = [];
        for ($i = 1; $i <= 100; $i++) {
            $sorteosToInsert[] = [
                'nombre' => "Gran Sorteo de Prueba #$i",
                'descripcion' => "Este es un sorteo generado automáticamente para pruebas de carga masiva.",
                'precio_ticket' => rand(10, 50),
                'fecha_inicio' => $now->copy()->subDays(rand(1, 30)),
                'fecha_fin' => $now->copy()->addDays(rand(10, 60)),
                'estado' => $i <= 10 ? 'activo' : 'programado', // 'inactivo' no existe en el enum
                'cantidad_tickets' => 100000,
                'user_id' => $adminId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('sorteos')->insert($sorteosToInsert);
        
        $sorteoIds = DB::table('sorteos')->pluck('id')->toArray();
        
        // Crear premios para los sorteos
        foreach ($sorteoIds as $sId) {
            for ($p = 1; $p <= 10; $p++) {
                $premiosToInsert[] = [
                    'sorteo_id' => $sId,
                    'nombre' => "Premio $p del Sorteo $sId",
                    'descripcion' => "Descripción de prueba para carga",
                    'orden' => $p,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        
        // Ejecutar los premios en sub-chunks para evitar el placeholder limit de SQLite/MySQL
        $premiosChunks = array_chunk($premiosToInsert, 1000);
        foreach($premiosChunks as $chunk) {
            DB::table('premios')->insert($chunk);
        }

        // 2. Crear 10,000 Usuarios (Batch insert para no explotar RAM)
        $this->command->info('Creando 10,000 usuarios...');
        $password = Hash::make('password');
        
        $usersCount = 10000;
        $batchSize = 1000;
        
        for ($batch = 0; $batch < $usersCount / $batchSize; $batch++) {
            $usersToInsert = [];
            for ($i = 0; $i < $batchSize; $i++) {
                $idx = ($batch * $batchSize) + $i + 1;
                $usersToInsert[] = [
                    'name' => "Carga Usuario $idx",
                    'dni' => str_pad(10000000 + $idx, 8, '0', STR_PAD_LEFT),
                    'email' => "testuser{$idx}@ejemplo.local",
                    'password' => $password,
                    'telefono' => '9' . str_pad($idx, 8, '0', STR_PAD_LEFT),
                    'is_admin' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            DB::table('users')->insert($usersToInsert);
            $this->command->info("Insertados " . (($batch + 1) * $batchSize) . " usuarios...");
        }

        $userIds = DB::table('users')->pluck('id')->toArray();

        // 3. Crear 10,000 Ventas / Compras y Tickets asociados
        $this->command->info('Generando 10,000 ventas (compras) y sus tickets...');
        $comprasCount = 10000;
        
        for ($batch = 0; $batch < $comprasCount / $batchSize; $batch++) {
            $comprasToInsert = [];
            $ticketsToInsert = [];
            
            for ($i = 0; $i < $batchSize; $i++) {
                $idx = ($batch * $batchSize) + $i + 1;
                
                $userId = $userIds[array_rand($userIds)];
                $sorteoId = $sorteoIds[array_rand($sorteoIds)];
                $cantidad = rand(1, 5); // 1 a 5 tickets por compra
                $precio = DB::table('sorteos')->where('id', $sorteoId)->value('precio_ticket');
                $total = $cantidad * $precio;

                $numerosComprados = [];
                for ($t = 0; $t < $cantidad; $t++) {
                    $numerosComprados[] = str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
                }

                $comprasToInsert[] = [
                    'user_id' => $userId,
                    'sorteo_id' => $sorteoId,
                    'total' => $total,
                    'metodo_pago' => ['yape', 'plin', 'transferencia', 'efectivo'][rand(0, 3)],
                    'estado' => ['aprobado', 'pendiente', 'rechazado'][rand(0, 1)], // Más aprobados
                    'comprobante' => null,
                    'detalles' => json_encode([
                        'cantidad' => $cantidad,
                        'modo_seleccion' => 'random',
                        'numeros_manuales' => [],
                        'tipo_venta' => 'Prueba de Carga',
                        'numeros_asignados' => $numerosComprados
                    ]),
                    'created_at' => $now->copy()->subMinutes(rand(1, 10000)),
                    'updated_at' => $now,
                ];
                
                // Generar los tickets (sabiendo que podría haber colisiones en random, 
                // pero para test de performance de UI es suficiente)
                foreach($numerosComprados as $n) {
                    $ticketsToInsert[] = [
                        'sorteo_id' => $sorteoId,
                        'numero' => $n,
                        'estado' => 'vendido',
                        'user_id' => $userId,
                        'fecha_venta' => $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
            DB::table('compras')->insert($comprasToInsert);
            
            // Insertar tickets en sub-batches de 1000 para no romper el placeholder limit
            $ticketChunks = array_chunk($ticketsToInsert, 1000);
            foreach($ticketChunks as $chunk) {
                DB::table('tickets')->insertOrIgnore($chunk);
            }
            
            $this->command->info("Insertadas " . (($batch + 1) * $batchSize) . " compras y sus tickets...");
        }

        $this->command->info('¡Sembrado Masivo Completado con Éxito!');
    }
}
