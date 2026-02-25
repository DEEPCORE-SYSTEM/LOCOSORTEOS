<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role = 'admin'): Response
    {
        if (!auth()->check()) {
            return redirect()->route('admin.login');
        }

        if ($role === 'admin' && !auth()->user()->is_admin) {
            
            return redirect()->route('dashboard')->with('error', 'No tienes permisos de administrador.');
        }

        return $next($request);
    }
}
