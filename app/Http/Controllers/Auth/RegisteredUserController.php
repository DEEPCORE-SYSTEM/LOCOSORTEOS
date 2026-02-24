<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/LoginRegister', [
            'renderMode' => 'register'
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'dni' => 'required|string|size:8|unique:'.User::class,
            'name' => 'required|string|max:255',
            'telefono' => 'required|string|max:20',
            'departamento' => 'required|string|max:100',
            'password' => ['required', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'dni' => $request->dni,
            'name' => $request->name,
            'telefono' => $request->telefono,
            'departamento' => $request->departamento,
            'password' => Hash::make($request->password),
            'tipo_registro' => 'web',
            'estado' => 'activo'
        ]);

        if (User::count() === 1) {
            $user->assignRole('admin');
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
