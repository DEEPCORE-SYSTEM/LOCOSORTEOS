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
        

        User::create([
            'name' => 'Usuario Cliente',
            'dni' => '72345678',
            'email' => 'cliente@finagro.com',
            'password' => bcrypt('password'),
            'telefono' => '987654321',
            'is_admin' => false,
        ]);

        User::create([
            'name' => 'Admin Finagro Maestro',
            'dni' => '11111111',
            'email' => 'admin@finagro.com',
            'password' => bcrypt('password'),
            'telefono' => '999999999',
            'is_admin' => true,
        ]);

        $this->call([
            RoleSeeder::class,
            SorteosSeeder::class,
        ]);
    }
}
