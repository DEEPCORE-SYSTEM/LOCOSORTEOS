<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ganador extends Model
{
    protected $table = 'ganadores';

    protected $fillable = [
        'premio_id',
        'ticket_id',
        'user_id',
        'sorteo_id',
        'fecha_sorteo',
        'tipo',
        'imagen',
        'destacado',
    ];

    protected $casts = [
        'fecha_sorteo' => 'datetime',
        'destacado' => 'boolean',
    ];

    public function sorteo()
    {
        return $this->belongsTo(Sorteo::class);
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function premio()
    {
        return $this->belongsTo(Premio::class);
    }
}
