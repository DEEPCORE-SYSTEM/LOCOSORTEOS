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
