<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Ejecutar roles primero
        $this->call([
            RoleSeeder::class,
        ]);

        // 2. Crear un único super administrador para producción
        $admin = User::firstOrCreate(
            ['email' => 'sorteos@campoagro.com'],
            [
                'name' => 'Administrador Principal',
                'dni' => '11111111',
                'password' => bcrypt('password'),
                'telefono' => '999999999',
                'is_admin' => true,
            ]
        );

        $admin->assignRole('admin');
    }
}
