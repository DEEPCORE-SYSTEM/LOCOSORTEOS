<?php

namespace App\Http\Middleware;

use App\Models\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'settings' => function () {
                return Cache::remember('site_settings', 3600, function () {
                    $s = SiteSettings::all_flat();
                    return [
                        'yape_numero'  => $s['yape_numero']  ?? '',
                        'plin_numero'  => $s['plin_numero']   ?? '',
                        'whatsapp'     => $s['whatsapp']      ?? '',
                        'razon_social' => $s['razon_social']  ?? 'INVERSIONES CampoAgro E.I.R.L.',
                        'link_redes'   => $s['link_redes']    ?? '',
                        'tiktok_url'   => $s['tiktok_url']    ?? '',
                    ];
                });
            },
            'globalPendingTicketsCount' => function () use ($request) {
                if ($request->user() && $request->user()->is_admin) {
                    return \App\Models\Compra::where('estado', 'pendiente')->count();
                }
                return 0;
            },
            'globalPendingTickets' => function () use ($request) {
                if ($request->user() && $request->user()->is_admin) {
                    return \App\Models\Compra::with('user')
                        ->where('estado', 'pendiente')
                        ->orderBy('created_at', 'desc')
                        ->take(5)
                        ->get()
                        ->map(function($compra) {
                            return [
                                'id' => $compra->id,
                                'user_name' => $compra->user ? $compra->user->name : 'Usuario',
                                'total' => $compra->total,
                                'time_ago' => $compra->created_at->diffForHumans(),
                            ];
                        });
                }
                return [];
            },
        ];
    }
}
