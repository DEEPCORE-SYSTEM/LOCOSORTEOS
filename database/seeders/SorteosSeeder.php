<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sorteo;
use App\Models\User;
use Carbon\Carbon;

class SorteosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Encontrar o crear un usuario Admin al que asociar el sorteo
        $admin = User::role('admin')->first();
        if (!$admin) {
            $admin = User::first();
        }

        if (!$admin) {
            return;
        }

        // Crear el Sorteo principal de ficher.jsx
        $sorteoInfo = [
            'nombre' => 'Gran Sorteo 28 de Febrero',
            'tipo' => 'General',
            'imagen_hero' => 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1920', // URL fondo
            'descripcion' => 'Participa con confianza y gana grandes premios vehiculares, efectivo y tecnología con el sorteo más transparente, respaldado por el sector agrario.',
            'fecha_inicio' => Carbon::now()->subDays(10),
            'fecha_fin' => Carbon::createFromFormat('Y-m-d H:i:s', '2026-02-28 20:00:00'),
            'cantidad_tickets' => 5000,
            'precio_ticket' => 40.00,
            'estado' => 'activo',
            'user_id' => $admin->id,
        ];

        $sorteo = Sorteo::create($sorteoInfo);

        // Crear Premios basados en ficher.jsx
        $premiosFicher = [
            ['orden' => 1, 'qty' => 1, 'name' => 'FORD - TERRITORY', 'type' => 'Camioneta', 'image' => 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600'],
            ['orden' => 2, 'qty' => 1, 'name' => 'Toyota Avanza', 'type' => 'Camioneta', 'image' => 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=600'],
            ['orden' => 3, 'qty' => 8, 'name' => 'Toyota Yaris', 'type' => 'Auto', 'image' => 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=600'],
            ['orden' => 4, 'qty' => 1, 'name' => 'Toyota Rush', 'type' => 'Camioneta', 'image' => 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600'],
            ['orden' => 5, 'qty' => 1, 'name' => 'Corolla Cross', 'type' => 'Camioneta', 'image' => 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600'],
            ['orden' => 6, 'qty' => 1, 'name' => 'Toyota Rav 4', 'type' => 'Camioneta', 'image' => 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=600'],
            ['orden' => 7, 'qty' => 1, 'name' => 'Toyota Hilux', 'type' => 'Pick-up', 'image' => 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=600'],
            ['orden' => 8, 'qty' => 15, 'name' => 'Motos NS200', 'type' => 'Motocicleta', 'image' => 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600'],
            ['orden' => 9, 'qty' => 170, 'name' => 'Fajos S/ 1,200', 'type' => 'Efectivo', 'image' => 'https://images.unsplash.com/photo-1610337673044-720471f83677?auto=format&fit=crop&q=80&w=600'],
            ['orden' => 10, 'qty' => 15, 'name' => 'iPhone 17 Pro Max', 'type' => 'Tecnología', 'image' => 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?auto=format&fit=crop&q=80&w=600']
        ];

        foreach ($premiosFicher as $premio) {
            $sorteo->premios()->create([
                'nombre' => $premio['name'],
                'cantidad' => $premio['qty'],
                'tipo' => $premio['type'],
                'imagen' => $premio['image'],
                'orden' => $premio['orden']
            ]);
        }
    }
}
