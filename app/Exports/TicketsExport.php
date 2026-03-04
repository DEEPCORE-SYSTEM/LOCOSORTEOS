<?php

namespace App\Exports;

use App\Models\Ticket;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TicketsExport implements FromQuery, ShouldQueue, WithChunkReading, WithHeadings, WithMapping
{
    use Exportable;

    private $sorteoId;
    private $numeros;

    public function __construct(int $sorteoId, array $numeros)
    {
        $this->sorteoId = $sorteoId;
        $this->numeros = $numeros;
    }

    public function query()
    {
        return Ticket::query()
                     ->with(['user', 'sorteo'])
                     ->where('sorteo_id', $this->sorteoId)
                     ->whereIn('numero', $this->numeros)
                     ->orderBy('numero');
    }

    public function headings(): array
    {
        return [
            'ID Ticket',
            'Sorteo',
            'Número de Ticket',
            'Estado',
            'Adquirido Por',
            'Fecha Validación'
        ];
    }

    public function map($ticket): array
    {
        return [
            $ticket->id,
            $ticket->sorteo->nombre ?? 'N/A',
            $ticket->numero,
            $ticket->estado,
            $ticket->user->name ?? 'N/A',
            $ticket->fecha_venta ? \Carbon\Carbon::parse($ticket->fecha_venta)->format('d/m/Y H:i') : ''
        ];
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
