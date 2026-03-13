<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Premio extends Model
{
    protected $appends = [
        'imagen_url',
    ];

    protected $fillable = [
        'sorteo_id',
        'nombre',
        'cantidad',
        'tipo',
        'descripcion',
        'imagen',
        'orden'
    ];

    public function setImagenAttribute($value): void
    {
        $this->attributes['imagen'] = $this->normalizePublicStoragePath($value);
    }

    public function getImagenUrlAttribute(): ?string
    {
        return $this->resolvePublicStorageUrl($this->attributes['imagen'] ?? null);
    }

    public function sorteo()
    {
        return $this->belongsTo(Sorteo::class);
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
