<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicoController;
use App\Http\Controllers\SorteoEjecucionController;
use App\Http\Controllers\User\CheckoutController;
use Illuminate\Support\Facades\Route;

// ─── Rutas Públicas ────────────────────────────────────────────────────────────

Route::get('/', [PublicoController::class, 'welcome'])->name('home');

Route::get('/ganadores', [PublicoController::class, 'ganadores'])->name('publico.ganadores');

Route::get('/difusion', [PublicoController::class, 'difusion'])->name('publico.difusion');

// ─── Ruta de la API de DNI ─────────────────────────────────────────────────────

Route::post('/api/consultar-dni', [\App\Http\Controllers\Api\DniController::class, 'consultar'])->name('api.consultar_dni');

// ─── Rutas Autenticadas del Usuario ────────────────────────────────────────────

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [PublicoController::class, 'dashboard'])->name('dashboard');
    Route::post('/comprar', [CheckoutController::class, 'store'])->name('comprar');
});

// ─── Perfil de Usuario ─────────────────────────────────────────────────────────

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ─── Admin ─────────────────────────────────────────────────────────────────────

Route::post('/sorteos/{id}/ejecutar', [SorteoEjecucionController::class, 'ejecutar'])
    ->middleware('role:admin');

Route::prefix('admin')->group(function () {
    require __DIR__.'/admin.php';
});

require __DIR__.'/auth.php';
