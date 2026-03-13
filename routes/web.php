<?php

use App\Http\Controllers\PublicoController;
use App\Http\Controllers\SorteoEjecucionController;
use App\Http\Controllers\User\CheckoutController;
use Illuminate\Support\Facades\Route;



Route::get('/', [PublicoController::class, 'welcome'])->name('home');

// Checkout publico (sin login)
Route::get('/participar', [PublicoController::class, 'checkoutPublic'])->name('participar');

// Mis tickets (sin login)
Route::get('/mis-tickets', [PublicoController::class, 'misTickets'])->name('mis_tickets');
Route::get('/mis-tickets/exportar/{compra}', [PublicoController::class, 'exportMisTickets'])->name('mis_tickets.export');

Route::get('/ganadores', [PublicoController::class, 'ganadores'])->name('publico.ganadores');

Route::get('/difusion', [PublicoController::class, 'difusion'])->name('publico.difusion');



Route::post('/api/consultar-dni', [\App\Http\Controllers\Api\DniController::class, 'consultar'])->name('api.consultar_dni');
Route::get('/api/sorteos/{sorteo}/tickets', [PublicoController::class, 'apiTickets'])->name('api.sorteos.tickets');

// Compra publica (sin login)
Route::post('/comprar', [CheckoutController::class, 'store'])->name('comprar');



Route::post('/sorteos/{id}/ejecutar', [SorteoEjecucionController::class, 'ejecutar'])
    ->middleware('role:admin');

Route::prefix('admin')->group(function () {
    require __DIR__.'/admin.php';
});

require __DIR__.'/auth.php';
