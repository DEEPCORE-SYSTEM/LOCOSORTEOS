<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'sorteo_id',
        'participant_id',
        'numero',
        'estado',
        'fecha_venta'
    ];

    public function sorteo()
    {
        return $this->belongsTo(Sorteo::class);
    }

    public function participante()
    {
        return $this->belongsTo(Participante::class, 'participant_id');
    }

    public function compras()
    {
        return $this->belongsToMany(Compra::class, 'compra_ticket');
    }
}
