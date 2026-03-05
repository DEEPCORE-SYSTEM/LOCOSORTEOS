<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Sorteo;
use App\Models\Premio;
use App\Models\Compra;
use App\Models\Ticket;
use App\Models\Ganador;
use App\Models\Mensaje;

class StressTestSeeder extends Seeder
{
    /**
     * Seeder de prueba masiva — verifica lógica de negocios real.
     * Crea: 120 usuarios, 5 sorteos, 3-5 premios/sorteo,
     * ~180 compras (aprobadas/pendientes/rechazadas), ~400+ tickets, y ejecuta el bombo
     */
    public function run(): void
    {
        $this->command->info('=== STRESS TEST SEEDER ===');

        
        $admin = User::firstOrCreate(
            ['dni' => '00000001'],
            [
                'name'     => 'Admin Sistema',
                'email'    => 'admin@sorteos.test',
                'password' => Hash::make('password'),
                'telefono' => '999000001',
                'is_admin' => true,
                'estado'   => 'activo',
            ]
        );

        
        try {
            if (!\Spatie\Permission\Models\Role::where('name', 'admin')->exists()) {
                \Spatie\Permission\Models\Role::create(['name' => 'admin', 'guard_name' => 'web']);
            }
            $admin->assignRole('admin');
        } catch (\Exception $e) {
            $this->command->warn('  [!] No se pudo asignar rol Spatie: ' . $e->getMessage());
        }

        $this->command->info('[OK] Admin creado (dni: 00000001 / pass: password)');

        
        $this->command->info('Creando 120 usuarios participantes...');
        $departamentos = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Junín', 'Cajamarca', 'Puno'];
        $users = [];

        for ($i = 2; $i <= 121; $i++) {
            $dni = str_pad($i, 8, '0', STR_PAD_LEFT);
            $u = User::firstOrCreate(
                ['dni' => $dni],
                [
                    'name'           => fake('es_PE')->name(),
                    'email'          => "user{$i}@sorteos.test",
                    'password'       => Hash::make('password'),
                    'telefono'       => '9' . rand(10000000, 99999999),
                    'departamento'   => $departamentos[array_rand($departamentos)],
                    'tipo_registro'  => rand(0, 1) ? 'web' : 'fisico',
                    'is_admin'       => false,
                    'estado'         => $i % 15 === 0 ? 'bloqueado' : 'activo', 
                ]
            );
            $users[] = $u;
        }
        $this->command->info('[OK] 120 usuarios creados. ('.count(array_filter($users, fn($u) => $u->estado === 'bloqueado')).' bloqueados)');

        
        $this->command->info('Creando 5 sorteos con premios...');

        $sorteosData = [
            [
                'nombre'           => 'Gran Sorteo Navidad 2025',
                'tipo'             => 'Navidad',
                'descripcion'      => 'El sorteo más grande del año con premios increíbles',
                'fecha_inicio'     => '2025-12-01 00:00:00',
                'fecha_fin'        => '2025-12-24 23:59:00',
                'cantidad_tickets' => 500,
                'precio_ticket'    => 10.00,
                'estado'           => 'finalizado',
                'premios' => [
                    ['nombre' => '1er Premio: Auto Kia Picanto', 'descripcion' => 'Auto 0km 2025', 'orden' => 1, 'cantidad' => 1],
                    ['nombre' => '2do Premio: Smart TV 65"',     'descripcion' => 'Samsung QLED',  'orden' => 2, 'cantidad' => 1],
                    ['nombre' => '3er Premio: Laptop HP',         'descripcion' => 'Core i7 16GB',  'orden' => 3, 'cantidad' => 1],
                ],
            ],
            [
                'nombre'           => 'Sorteo San Valentín 2026',
                'tipo'             => 'Especial',
                'descripcion'      => 'Sorprendé a tu pareja con este sorteo romántico',
                'fecha_inicio'     => '2026-02-01 00:00:00',
                'fecha_fin'        => '2026-02-14 23:59:00',
                'cantidad_tickets' => 200,
                'precio_ticket'    => 15.00,
                'estado'           => 'finalizado',
                'premios' => [
                    ['nombre' => '1er Premio: Viaje a Cusco x2',  'descripcion' => 'Vuelo + hotel 3 noches', 'orden' => 1, 'cantidad' => 1],
                    ['nombre' => '2do Premio: Cena Temática',      'descripcion' => 'Restaurante 5 estrellas', 'orden' => 2, 'cantidad' => 2],
                ],
            ],
            [
                'nombre'           => 'Sorteo Aniversario LOCO 2026',
                'tipo'             => 'Aniversario',
                'descripcion'      => 'Celebramos nuestro aniversario con premios top',
                'fecha_inicio'     => '2026-02-20 00:00:00',
                'fecha_fin'        => '2026-03-15 23:59:00',
                'cantidad_tickets' => 300,
                'precio_ticket'    => 20.00,
                'estado'           => 'activo',
                'premios' => [
                    ['nombre' => '1er Premio: Moto Honda CB300',   'descripcion' => '0km, color a elección', 'orden' => 1, 'cantidad' => 1],
                    ['nombre' => '2do Premio: iPad Pro 11"',        'descripcion' => 'Apple M4 256GB',        'orden' => 2, 'cantidad' => 1],
                    ['nombre' => '3er Premio: iPhone 16',           'descripcion' => 'Apple iPhone 16 128GB', 'orden' => 3, 'cantidad' => 1],
                    ['nombre' => '4to Premio: AirPods Pro',         'descripcion' => 'Apple AirPods Pro 2',   'orden' => 4, 'cantidad' => 3],
                ],
            ],
            [
                'nombre'           => 'Mini Sorteo Flash #1',
                'tipo'             => 'Flash',
                'descripcion'      => 'Solo 50 tickets, premio seguro',
                'fecha_inicio'     => '2026-02-25 10:00:00',
                'fecha_fin'        => '2026-02-28 23:59:00',
                'cantidad_tickets' => 50,
                'precio_ticket'    => 50.00,
                'estado'           => 'activo',
                'premios' => [
                    ['nombre' => '1er Premio: S/. 1500 en efectivo', 'descripcion' => 'Transferencia inmediata', 'orden' => 1, 'cantidad' => 1],
                ],
            ],
            [
                'nombre'           => 'Sorteo Escolar 2026',
                'tipo'             => 'Escolar',
                'descripcion'      => 'Útiles y tablets para familias participantes',
                'fecha_inicio'     => '2026-03-01 00:00:00',
                'fecha_fin'        => '2026-03-31 23:59:00',
                'cantidad_tickets' => 150,
                'precio_ticket'    => 5.00,
                'estado'           => 'programado',
                'premios' => [
                    ['nombre' => '1er Premio: Tablet Samsung A9+',  'descripcion' => '64GB, WiFi', 'orden' => 1, 'cantidad' => 1],
                    ['nombre' => '2do Premio: Kit Útiles Premium',   'descripcion' => 'Completo textos + mochila', 'orden' => 2, 'cantidad' => 5],
                ],
            ],
        ];

        $sorteos = [];
        foreach ($sorteosData as $sd) {
            $premiosData = $sd['premios'];
            unset($sd['premios']);
            $sd['user_id'] = $admin->id;
            $sorteo = Sorteo::create($sd);
            $sorteo->premios()->createMany($premiosData);
            $sorteos[] = $sorteo;
            $this->command->line("  → {$sorteo->nombre} (ID:{$sorteo->id}, estado:{$sorteo->estado})");
        }
        $this->command->info('[OK] 5 sorteos creados con ' . array_sum(array_map(fn($sd) => count($sd['premios'] ?? []), $sorteosData)) . ' premios en total');

        
        $this->command->info('Generando compras y tickets (~180 compras)...');

        $metodoPago = ['yape', 'plin', 'transferencia', 'efectivo'];
        $totalCompras = 0;
        $totalTickets = 0;
        $errores = [];

        foreach ($sorteos as $sorteo) {
            $ticketsOcupados = [];

            
            $numCompras = match(true) {
                $sorteo->cantidad_tickets <= 50  => 20,
                $sorteo->cantidad_tickets <= 200 => 40,
                default                          => 50,
            };

            for ($c = 0; $c < $numCompras; $c++) {
                $user = $users[array_rand($users)];
                $cantidad = rand(1, 5);
                $metodoPagoSel = $metodoPago[array_rand($metodoPago)];

                
                $rand = rand(1, 100);
                $estado = match(true) {
                    $rand <= 60 => 'aprobado',
                    $rand <= 85 => 'pendiente',
                    default     => 'rechazado',
                };

                $modoSeleccion = rand(0, 1) ? 'random' : 'manual';

                $compra = Compra::create([
                    'user_id'        => $user->id,
                    'sorteo_id'      => $sorteo->id,
                    'total'          => $cantidad * $sorteo->precio_ticket,
                    'metodo_pago'    => $metodoPagoSel,
                    'comprobante'    => $estado !== 'pendiente' ? 'comprobantes/fake_' . rand(1000, 9999) . '.jpg' : null,
                    'estado'         => $estado,
                    'registrado_por' => rand(0, 1) ? $admin->id : null,
                    'motivo_rechazo' => $estado === 'rechazado' ? 'Comprobante ilegible o monto incorrecto' : null,
                    'detalles'       => [
                        'cantidad'        => $cantidad,
                        'modo_seleccion'  => $modoSeleccion,
                        'numeros_manuales'=> $modoSeleccion === 'manual' ? $this->generarNumerosDisponibles($cantidad, $ticketsOcupados, $sorteo->cantidad_tickets) : [],
                        'tipo_venta'      => rand(0, 1) ? 'Online' : 'Talonario Físico',
                    ],
                    'created_at' => now()->subDays(rand(0, 30)),
                ]);

                $totalCompras++;

                
                if ($estado === 'aprobado') {
                    for ($t = 0; $t < $cantidad; $t++) {
                        $num = $this->generarNumeroLibre($ticketsOcupados, $sorteo->cantidad_tickets);
                        if ($num !== null) {
                            Ticket::create([
                                'sorteo_id'  => $sorteo->id,
                                'numero'     => $num,
                                'estado'     => 'vendido',
                                'user_id'    => $user->id,
                                'fecha_venta'=> now()->subDays(rand(0, 25)),
                            ]);
                            $ticketsOcupados[] = $num;
                            $totalTickets++;
                        } else {
                            $errores[] = "Sorteo {$sorteo->id}: sin espacio para más tickets en iteración {$t}";
                            break;
                        }
                    }
                }
            }
            $vendidos = Ticket::where('sorteo_id', $sorteo->id)->where('estado', 'vendido')->count();
            $this->command->line("  → Sorteo [{$sorteo->nombre}]: {$vendidos} tickets vendidos");
        }

        $this->command->info("[OK] {$totalCompras} compras, {$totalTickets} tickets generados.");

        
        $this->command->info('Ejecutando bombo en sorteos finalizados...');
        $sorteosFinalizados = Sorteo::where('estado', 'finalizado')->get();
        $totalGanadores = 0;

        foreach ($sorteosFinalizados as $sorteo) {
            $ticketsVendidosIds = Ticket::where('sorteo_id', $sorteo->id)
                ->where('estado', 'vendido')
                ->pluck('id')
                ->toArray();

            if (count($ticketsVendidosIds) === 0) {
                $this->command->warn("  [!] Sorteo {$sorteo->nombre} sin tickets vendidos, omitido.");
                continue;
            }

            shuffle($ticketsVendidosIds);
            $premios = $sorteo->premios()->orderBy('orden')->get();

            foreach ($premios as $index => $premio) {
                if (!isset($ticketsVendidosIds[$index])) break;
                $ticket = Ticket::find($ticketsVendidosIds[$index]);

                
                $existe = Ganador::where('premio_id', $premio->id)->exists();
                if (!$existe) {
                    Ganador::create([
                        'premio_id'   => $premio->id,
                        'ticket_id'   => $ticket->id,
                        'user_id'     => $ticket->user_id,
                        'sorteo_id'   => $sorteo->id, 
                        'fecha_sorteo'=> now()->subDays(rand(1, 10)),
                    ]);
                    $totalGanadores++;
                }
            }
            $this->command->line("  → {$sorteo->nombre}: ganadores registrados");
        }
        $this->command->info("[OK] {$totalGanadores} ganadores registrados.");

        
        $this->command->info('Creando mensajes de difusión...');
        $mensajes = [
            ['title' => '🎉 ¡Nuevo Sorteo Disponible!',       'content' => 'Participa en el Sorteo Aniversario LOCO 2026. Solo S/.20 por ticket.',  'type' => 'promo'],
            ['title' => '⚠ Cambio de fecha',                  'content' => 'El sorteo Flash #1 se amplía hasta el 28 de febrero por alta demanda.', 'type' => 'alert'],
            ['title' => '📰 Resultados Navidad 2025',          'content' => 'Felicitamos a los ganadores del Gran Sorteo Navidad 2025.',              'type' => 'news'],
            ['title' => '🎁 Promo del día',                    'content' => 'Compra 3 tickets y obtén 1 adicional gratis. ¡Solo hoy!',               'type' => 'promo'],
            ['title' => '📣 Transparencia y Confianza',        'content' => 'Todos nuestros sorteos son auditados y transmitidos en vivo.',           'type' => 'news'],
        ];
        foreach ($mensajes as $m) {
            \App\Models\Mensaje::create($m + ['created_at' => now()->subDays(rand(0, 20))]);
        }
        $this->command->info('[OK] 5 mensajes de difusión creados.');

        
        $this->command->newLine();
        $this->command->info('══════════════════════════════════');
        $this->command->info('         RESUMEN STRESS TEST       ');
        $this->command->info('══════════════════════════════════');
        $this->command->table(
            ['Entidad', 'Total en BD'],
            [
                ['Usuarios (total)',    User::count()],
                ['Usuarios bloqueados', User::where('estado', 'bloqueado')->count()],
                ['Sorteos',             Sorteo::count()],
                ['Premios',             Premio::count()],
                ['Compras (total)',     Compra::count()],
                ['Compras aprobadas',  Compra::where('estado', 'aprobado')->count()],
                ['Compras pendientes', Compra::where('estado', 'pendiente')->count()],
                ['Compras rechazadas', Compra::where('estado', 'rechazado')->count()],
                ['Tickets vendidos',   Ticket::where('estado', 'vendido')->count()],
                ['Ganadores',          Ganador::count()],
                ['Mensajes',           \App\Models\Mensaje::count()],
            ]
        );

        
        $this->command->newLine();
        $this->command->info('══════════════════════════════════');
        $this->command->info('       VERIFICACIÓN DE BUGS       ');
        $this->command->info('══════════════════════════════════');

        
        $revenueBugQuery = Sorteo::withCount(['tickets as sold_bug' => function($q) {
            $q->where('estado', 'pagado'); 
        }])->withCount(['tickets as sold_fix' => function($q) {
            $q->where('estado', 'vendido'); 
        }])->get();

        $this->command->info('[BUG #1] Revenue usando estado="pagado" vs "vendido":');
        foreach ($revenueBugQuery as $s) {
            $revenueBug = $s->sold_bug * $s->precio_ticket;
            $revenueFix = $s->sold_fix * $s->precio_ticket;
            $this->command->line("  Sorteo [{$s->nombre}]: BUG→S/{$revenueBug} | CORRECTO→S/{$revenueFix}");
        }

        
        $this->command->info('[BUG #2] Generación de números para sorteos con >999 tickets:');
        $ocupados999 = range(1, 999); 
        for ($i = 0; $i < 3; $i++) {
            $num = $this->generarNumeroLibre($ocupados999, 9999);
            $this->command->line("  Número generado cuando 1-999 están ocupados: '{$num}' (longitud: " . strlen((string)$num) . ")");
        }

        
        $this->command->info('[BUG #4] Ganador::with([relaciones]) — probar navegación Eloquent:');
        try {
            $g = Ganador::with(['ticket', 'user', 'premio'])->first();
            if ($g) {
                $this->command->line("  ticket→ " . ($g->ticket ? $g->ticket->numero : 'NULL (relación no definida)'));
                $this->command->line("  user→   " . ($g->user ? $g->user->name : 'NULL (relación no definida)'));
                $this->command->line("  premio→ " . ($g->premio ? $g->premio->nombre : 'NULL (relación no definida)'));
            } else {
                $this->command->line("  (sin ganadores registrados)");
            }
        } catch (\Exception $e) {
            $this->command->error("  ERROR: " . $e->getMessage());
        }

        if (!empty($errores)) {
            $this->command->newLine();
            $this->command->warn('── Advertencias durante seeding ──');
            foreach ($errores as $e) {
                $this->command->warn("  [!] {$e}");
            }
        }

        $this->command->newLine();
        $this->command->info('✅ Stress test completado. Revisa los logs de BUGS arriba.');
    }

    /**
     * Genera un número de ticket libre (con formato de 3 dígitos).
     * Retorna null si no hay espacio.
     */
    private function generarNumeroLibre(array &$ocupados, int $maxTickets): ?string
    {
        $max = min($maxTickets, 999);
        $intentos = 0;
        while ($intentos < 500) {
            $candidato = str_pad(rand(1, $max), 3, '0', STR_PAD_LEFT);
            if (!in_array($candidato, $ocupados) && !in_array((int)$candidato, $ocupados)) {
                return $candidato;
            }
            $intentos++;
        }
        return null; 
    }

    /**
     * Genera $n números disponibles para selección manual, sin repetir con ocupados.
     */
    private function generarNumerosDisponibles(int $n, array $ocupados, int $maxTickets): array
    {
        $max = min($maxTickets, 999);
        $disponibles = [];
        $intentos = 0;
        while (count($disponibles) < $n && $intentos < 1000) {
            $num = str_pad(rand(1, $max), 3, '0', STR_PAD_LEFT);
            if (!in_array($num, $ocupados) && !in_array($num, $disponibles)) {
                $disponibles[] = $num;
            }
            $intentos++;
        }
        return $disponibles;
    }
}
