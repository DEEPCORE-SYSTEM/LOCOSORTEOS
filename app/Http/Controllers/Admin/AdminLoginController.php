<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class AdminLoginController extends Controller
{
    /**
     * Muestra la vista de login para administradores.
     */
    public function showLoginForm()
    {
        return Inertia::render('Admin/Auth/Login');
    }

    /**
     * Maneja la solicitud de login del administrador.
     */
    public function login(Request $request)
    {
        $request->validate([
            'loginUser' => 'required|string',
            'password' => 'required|string',
        ]);

        $userOrPhone = $request->input('loginUser');
        $field = strlen($userOrPhone) === 8 ? 'dni' : 'telefono';
        
        if (str_contains($userOrPhone, '@')) {
            $field = 'email';
        }

        if (Auth::attempt([$field => $userOrPhone, 'password' => $request->input('password')], $request->boolean('remember'))) {
            $request->session()->regenerate();
            
            
            if (Auth::user()->hasRole('admin')) {
                return redirect()->intended(route('admin.dashboard', absolute: false));
            }

            
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'loginUser' => 'No tienes permisos de Administrador.',
            ]);
        }

        throw ValidationException::withMessages([
            'loginUser' => trans('auth.failed'),
        ]);
    }
}
