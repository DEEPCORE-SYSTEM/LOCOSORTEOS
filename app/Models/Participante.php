<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Participante extends Model
{
    protected $fillable = [
        'dni',
        'name',
        'telefono',
        'departamento',
        'direccion',
        'estado',
    ];

    public function compras()
    {
        return $this->hasMany(Compra::class, 'participant_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'participant_id');
    }
}
