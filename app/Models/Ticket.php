<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'sorteo_id',
        'numero',
        'estado',
        'user_id',
        'fecha_venta'
    ];

    public function sorteo()
    {
        return $this->belongsTo(Sorteo::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
