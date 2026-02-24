<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\SorteoEjecucionController;

Route::get('/', function () {
    // Buscar el sorteo activo publicado
    $sorteo = \App\Models\Sorteo::with('premios')->where('estado', 'activo')->first();
    
    return Inertia::render('Welcome', [
        'sorteo' => $sorteo,
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,    
    ]);
});

Route::get('/ganadores', function () {
    return Inertia::render('Publico/Ganadores');
});

Route::get('/dashboard', function () {
    $sorteo = \App\Models\Sorteo::with('premios')->where('estado', 'activo')->first();
    return Inertia::render('User/Checkout', [
        'sorteo' => $sorteo
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::post('/comprar', [CompraController::class, 'comprar'])
    ->middleware('auth');


Route::post('/sorteos/{id}/ejecutar', [SorteoEjecucionController::class, 'ejecutar'])
    ->middleware('role:admin');
// Route::get('/sorteos', [SorteoController::class, 'index']);
// Route::get('/sorteos/{id}', [SorteoController::class, 'show']);

// RUTAS ADMINISTRATIVAS
Route::prefix('admin')->group(function () {
    // Rutas públicas de admin (login)
    Route::middleware('guest')->group(function () {
        Route::get('/login', [\App\Http\Controllers\Admin\AdminLoginController::class, 'showLoginForm'])->name('admin.login');
        Route::post('/login', [\App\Http\Controllers\Admin\AdminLoginController::class, 'login'])->name('admin.login.submit');
    });

    // Rutas protegidas de admin
    Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/sorteos', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'sorteos'])->name('admin.sorteos');
    Route::get('/sorteos/crear', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'createSorteo'])->name('admin.sorteos.crear');
    Route::post('/sorteos', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'storeSorteo'])->name('admin.sorteos.store');
    Route::get('/sorteos/{id}/editar', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'editSorteo'])->name('admin.sorteos.editar');
    Route::put('/sorteos/{id}', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'updateSorteo'])->name('admin.sorteos.update');
    Route::get('/ejecucion', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'ejecucion'])->name('admin.ejecucion');
    Route::get('/tickets', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'tickets'])->name('admin.tickets');
    Route::get('/usuarios', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'usuarios'])->name('admin.usuarios');
    Route::get('/contenido', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'contenido'])->name('admin.contenido');
    });
});

require __DIR__.'/auth.php';


