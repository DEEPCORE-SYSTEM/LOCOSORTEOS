<?php

use Illuminate\Support\Facades\Route;

// ─── Login del admin (solo invitados) ──────────────────────────────────────────

Route::middleware('guest')->group(function () {
    Route::get('/login', [\App\Http\Controllers\Admin\AdminLoginController::class, 'showLoginForm'])->name('admin.login');
    Route::post('/login', [\App\Http\Controllers\Admin\AdminLoginController::class, 'login'])->name('admin.login.submit');
});

// ─── Panel admin (solo role:admin) ────────────────────────────────────────────

Route::middleware(['role:admin'])->group(function () {

    // Dashboard y métricas
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // APIs internas (usadas desde el frontend admin)
    Route::get('/api/tickets-status/{sorteoId}', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'apiTicketsStatus'])->name('admin.api.tickets_status');
    Route::post('/api/draw-ticket', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'apiDrawTicket'])->name('admin.api.draw_ticket');

    // ── Sorteos ────────────────────────────────────────────────────────────────
    Route::get('/sorteos',              [\App\Http\Controllers\Admin\AdminDashboardController::class, 'sorteos'])->name('admin.sorteos');
    Route::get('/sorteos/crear',        [\App\Http\Controllers\Admin\AdminDashboardController::class, 'createSorteo'])->name('admin.sorteos.crear');
    Route::post('/sorteos',             [\App\Http\Controllers\Admin\AdminDashboardController::class, 'storeSorteo'])->name('admin.sorteos.store');
    Route::get('/sorteos/{id}/editar',  [\App\Http\Controllers\Admin\AdminDashboardController::class, 'editSorteo'])->name('admin.sorteos.editar');
    Route::put('/sorteos/{id}',         [\App\Http\Controllers\Admin\AdminDashboardController::class, 'updateSorteo'])->name('admin.sorteos.update');
    Route::delete('/sorteos/{id}',      [\App\Http\Controllers\Admin\AdminDashboardController::class, 'destroySorteo'])->name('admin.sorteos.destroy');
    Route::post('/sorteos/{id}/estado', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'toggleSorteoEstado'])->name('admin.sorteos.estado');

    // ── Ejecución del sorteo en vivo ───────────────────────────────────────────
    Route::get('/ejecucion', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'ejecucion'])->name('admin.ejecucion');

    // ── Tickets y compras ──────────────────────────────────────────────────────
    Route::get('/tickets',               [\App\Http\Controllers\Admin\TicketValidationController::class, 'index'])->name('admin.tickets');
    Route::post('/tickets/offline',      [\App\Http\Controllers\Admin\TicketValidationController::class, 'storeOffline'])->name('admin.tickets.offline');
    Route::post('/tickets/{id}/approve', [\App\Http\Controllers\Admin\TicketValidationController::class, 'approve'])->name('admin.tickets.approve');
    Route::post('/tickets/{id}/reject',  [\App\Http\Controllers\Admin\TicketValidationController::class, 'reject'])->name('admin.tickets.reject');
    Route::post('/tickets/export-pdf',   [\App\Http\Controllers\Admin\TicketValidationController::class, 'exportPdf'])->name('admin.tickets.export_pdf');
    Route::put('/compras/{id}',          [\App\Http\Controllers\Admin\TicketValidationController::class, 'updateCompra'])->name('admin.compras.update');
    Route::delete('/compras/{id}',       [\App\Http\Controllers\Admin\TicketValidationController::class, 'destroyCompra'])->name('admin.compras.destroy');

    // ── Usuarios ───────────────────────────────────────────────────────────────
    Route::get('/usuarios',                     [\App\Http\Controllers\Admin\AdminDashboardController::class, 'usuarios'])->name('admin.usuarios');
    Route::put('/usuarios/{id}',                [\App\Http\Controllers\Admin\AdminDashboardController::class, 'updateUsuario'])->name('admin.usuarios.update');
    Route::post('/usuarios/{id}/toggle-status', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'toggleUserStatus'])->name('admin.usuarios.toggle_status');
    Route::delete('/usuarios/{id}',             [\App\Http\Controllers\Admin\AdminDashboardController::class, 'destroyUsuario'])->name('admin.usuarios.destroy');

    // ── Difusión ───────────────────────────────────────────────────────────────
    Route::get('/difusion',        [\App\Http\Controllers\Admin\AdminDashboardController::class, 'difusion'])->name('admin.difusion');
    Route::post('/difusion',       [\App\Http\Controllers\Admin\AdminDashboardController::class, 'storeMensaje'])->name('admin.difusion.store');
    Route::put('/difusion/{id}',   [\App\Http\Controllers\Admin\AdminDashboardController::class, 'updateMensaje'])->name('admin.difusion.update');
    Route::delete('/difusion/{id}',[\App\Http\Controllers\Admin\AdminDashboardController::class, 'deleteMensaje'])->name('admin.difusion.delete');

    // ── Configuración del sitio ────────────────────────────────────────────────
    Route::get('/configuracion',  [\App\Http\Controllers\Admin\AdminDashboardController::class, 'getSettings'])->name('admin.settings.get');
    Route::post('/configuracion', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'updateSettings'])->name('admin.settings.update');
    Route::post('/upload-image',  [\App\Http\Controllers\Admin\AdminDashboardController::class, 'uploadImage'])->name('admin.upload_image');

    // ── Perfil del admin ───────────────────────────────────────────────────────
    Route::get('/perfil',            [\App\Http\Controllers\Admin\AdminProfileController::class, 'edit'])->name('admin.profile.edit');
    Route::patch('/perfil',          [\App\Http\Controllers\Admin\AdminProfileController::class, 'update'])->name('admin.profile.update');
    Route::put('/perfil/password',   [\App\Http\Controllers\Admin\AdminProfileController::class, 'updatePassword'])->name('admin.profile.password.update');

    // ── Exportaciones ──────────────────────────────────────────────────────────
    Route::get('/export/sorteo', [\App\Http\Controllers\Admin\ExportController::class, 'exportarSorteo'])->name('admin.export.sorteo');
});
