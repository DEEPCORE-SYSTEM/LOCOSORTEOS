<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\SorteoEjecucionController;

Route::get('/', function () {
    
    $sorteo = \App\Models\Sorteo::with('premios')->where('estado', 'activo')->first();
    
    return Inertia::render('Welcome', [
        'sorteo' => $sorteo,
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,    
    ]);
});


Route::post('/api/consultar-dni', [\App\Http\Controllers\Api\DniController::class, 'consultar'])->name('api.consultar_dni');

Route::get('/ganadores', function (\Illuminate\Http\Request $request) {
    $search = $request->input('search');

    $ganadoresQuery = \App\Models\Ganador::with(['sorteo', 'ticket', 'user', 'premio'])
        ->orderBy('created_at', 'desc');

    if ($search) {
        $ganadoresQuery->whereHas('user', function ($q) use ($search) {
            $q->where('dni', 'like', "%{$search}%");
        })->orWhereHas('ticket', function ($q) use ($search) {
            $q->where('numero', 'like', "%{$search}%");
        });
    }

    $ganadores = $ganadoresQuery->get()->map(function ($ganador) {
        return [
            'id' => $ganador->id,
            'user' => $ganador->user->name,
            'dni' => $ganador->user->dni,
            'ticket' => $ganador->ticket->numero,
            'sorteo' => $ganador->sorteo->nombre,
            'premio' => $ganador->premio->nombre,
            'fecha' => $ganador->created_at->format('d/m/Y')
        ];
    });

    return Inertia::render('Publico/Ganadores', [
        'ganadores' => $ganadores,
        'filters' => $request->only('search')
    ]);
})->name('publico.ganadores');

Route::get('/dashboard', function () {
    $sorteo = \App\Models\Sorteo::with('premios')->where('estado', 'activo')->first();
    return Inertia::render('User/Checkout', [
        'sorteo' => $sorteo
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/difusion', function () {
    $mensajes = \App\Models\Mensaje::orderBy('created_at', 'desc')->get()->map(function($m) {
        return [
            'id' => $m->id,
            'title' => $m->title,
            'content' => $m->content,
            'type' => $m->type,
            'date' => $m->created_at->locale('es')->diffForHumans()
        ];
    });
    return Inertia::render('Publico/Difusion', [
        'broadcastMessages' => $mensajes
    ]);
})->name('publico.difusion');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

use App\Http\Controllers\User\CheckoutController;

Route::post('/comprar', [CheckoutController::class, 'store'])
    ->middleware('auth');


Route::post('/sorteos/{id}/ejecutar', [SorteoEjecucionController::class, 'ejecutar'])
    ->middleware('role:admin');




Route::prefix('admin')->group(function () {
    
    Route::middleware('guest')->group(function () {
        Route::get('/login', [\App\Http\Controllers\Admin\AdminLoginController::class, 'showLoginForm'])->name('admin.login');
        Route::post('/login', [\App\Http\Controllers\Admin\AdminLoginController::class, 'login'])->name('admin.login.submit');
    });

    
    Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/sorteos', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'sorteos'])->name('admin.sorteos');
    Route::get('/sorteos/crear', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'createSorteo'])->name('admin.sorteos.crear');
    Route::post('/sorteos', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'storeSorteo'])->name('admin.sorteos.store');
    Route::get('/sorteos/{id}/editar', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'editSorteo'])->name('admin.sorteos.editar');
    Route::put('/sorteos/{id}', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'updateSorteo'])->name('admin.sorteos.update');
    Route::delete('/sorteos/{id}', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'destroySorteo'])->name('admin.sorteos.destroy');
    Route::get('/ejecucion', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'ejecucion'])->name('admin.ejecucion');
    Route::get('/tickets', [\App\Http\Controllers\Admin\TicketValidationController::class, 'index'])->name('admin.tickets');
    Route::post('/tickets/offline', [\App\Http\Controllers\Admin\TicketValidationController::class, 'storeOffline'])->name('admin.tickets.offline');
    Route::post('/tickets/{id}/approve', [\App\Http\Controllers\Admin\TicketValidationController::class, 'approve'])->name('admin.tickets.approve');
    Route::post('/tickets/{id}/reject', [\App\Http\Controllers\Admin\TicketValidationController::class, 'reject'])->name('admin.tickets.reject');
    Route::get('/usuarios', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'usuarios'])->name('admin.usuarios');
    Route::put('/usuarios/{id}', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'updateUsuario'])->name('admin.usuarios.update');
    Route::post('/usuarios/{id}/toggle-status', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'toggleUserStatus'])->name('admin.usuarios.toggle_status');
    Route::get('/difusion', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'difusion'])->name('admin.difusion');
    Route::post('/difusion', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'storeMensaje'])->name('admin.difusion.store');
    Route::put('/difusion/{id}', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'updateMensaje'])->name('admin.difusion.update');
    Route::delete('/difusion/{id}', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'deleteMensaje'])->name('admin.difusion.delete');
    });
});

require __DIR__.'/auth.php';


