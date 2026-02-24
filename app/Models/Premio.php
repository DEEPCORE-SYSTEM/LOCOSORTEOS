<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Premio extends Model
{
    protected $fillable = [
        'sorteo_id',
        'nombre',
        'cantidad',
        'tipo',
        'descripcion',
        'imagen',
        'orden'
    ];

    public function sorteo()
    {
        return $this->belongsTo(Sorteo::class);
    }
}
