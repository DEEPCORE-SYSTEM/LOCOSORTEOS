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
        'comprobante',
        'registrado_por'
    ];

    public function tickets()
    {
        return $this->belongsToMany(Ticket::class, 'compra_ticket');
    }

    public function cliente()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
