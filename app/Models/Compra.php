<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    protected $fillable = [
        'user_id',
        'sorteo_id',
        'total',
        'metodo_pago',
        'estado',
        'motivo_rechazo',
        'comprobante',
        'detalles',
        'registrado_por',
    ];

    protected $casts = [
        'detalles' => 'array',
    ];

    public function tickets()
    {
        return $this->belongsToMany(Ticket::class, 'compra_ticket');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sorteo()
    {
        return $this->belongsTo(Sorteo::class, 'sorteo_id');
    }
}
