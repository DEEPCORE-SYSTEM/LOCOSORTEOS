<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sorteo extends Model
{
    protected $fillable = [
        'nombre',
        'tipo',
        'imagen_hero',
        'banner_promocional',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'cantidad_tickets',
        'precio_ticket',
        'estado',
        'user_id',
        'prefijo_ticket',
        'digitos_ticket'
    ];

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
}
