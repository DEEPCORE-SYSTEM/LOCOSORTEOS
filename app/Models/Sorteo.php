<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sorteo extends Model
{
    protected $appends = [
        'imagen_hero_url',
        'banner_promocional_url',
    ];

    protected $fillable = [
        'nombre',
        'tipo',
        'imagen_hero',
        'banner_promocional',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'fecha_sorteo',
        'cantidad_tickets',
        'precio_ticket',
        'estado',
        'user_id',
        'prefijo_ticket',
        'digitos_ticket'
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'fecha_sorteo' => 'datetime',
        'precio_ticket' => 'float',
    ];

    public function setImagenHeroAttribute($value): void
    {
        $this->attributes['imagen_hero'] = $this->normalizePublicStoragePath($value);
    }

    public function setBannerPromocionalAttribute($value): void
    {
        $this->attributes['banner_promocional'] = $this->normalizePublicStoragePath($value);
    }

    public function getImagenHeroUrlAttribute(): ?string
    {
        return $this->resolvePublicStorageUrl($this->attributes['imagen_hero'] ?? null);
    }

    public function getBannerPromocionalUrlAttribute(): ?string
    {
        return $this->resolvePublicStorageUrl($this->attributes['banner_promocional'] ?? null);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function premios()
    {
        return $this->hasMany(Premio::class);
    }

    public function compras()
    {
        return $this->hasMany(Compra::class);
    }

    public function ganadores()
    {
        return $this->hasMany(Ganador::class);
    }

    private function normalizePublicStoragePath($value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $value)) {
            $urlPath = parse_url($value, PHP_URL_PATH) ?: '';

            if ($urlPath === '' || ! str_contains($urlPath, '/storage/')) {
                return $value;
            }

            $value = Str::after($urlPath, '/storage/');
        }

        $value = ltrim($value, '/');

        if (Str::startsWith($value, 'storage/')) {
            $value = Str::after($value, 'storage/');
        }

        return $value === '' ? null : $value;
    }

    private function resolvePublicStorageUrl($value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $value)) {
            return $value;
        }

        $path = $this->normalizePublicStoragePath($value);

        return $path ? asset('storage/' . ltrim($path, '/')) : null;
    }
}
