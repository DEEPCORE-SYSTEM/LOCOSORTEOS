<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicoController;
use App\Http\Controllers\SorteoEjecucionController;
use App\Http\Controllers\User\CheckoutController;
use Illuminate\Support\Facades\Route;



Route::get('/', [PublicoController::class, 'welcome'])->name('home');

Route::get('/ganadores', [PublicoController::class, 'ganadores'])->name('publico.ganadores');

Route::get('/difusion', [PublicoController::class, 'difusion'])->name('publico.difusion');



Route::post('/api/consultar-dni', [\App\Http\Controllers\Api\DniController::class, 'consultar'])->name('api.consultar_dni');
Route::get('/api/sorteos/{sorteo}/tickets', [PublicoController::class, 'apiTickets'])->name('api.sorteos.tickets');



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [PublicoController::class, 'dashboard'])->name('dashboard');
    Route::get('/mis-compras/{compra}/tickets', [PublicoController::class, 'verTickets'])->name('user.compras.tickets');
    Route::post('/comprar', [CheckoutController::class, 'store'])->name('comprar');
    Route::post('/perfil/actualizar', [PublicoController::class, 'updateProfile'])->name('perfil.update');
});



Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



Route::post('/sorteos/{id}/ejecutar', [SorteoEjecucionController::class, 'ejecutar'])
    ->middleware('role:admin');

Route::prefix('admin')->group(function () {
    require __DIR__.'/admin.php';
});

require __DIR__.'/auth.php';
