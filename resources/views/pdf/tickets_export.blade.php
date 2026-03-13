<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Tickets para Sorteo Manual</title>
    <style>
        @page { margin: 10mm; size: A4; }
        body { font-family: sans-serif; margin: 0; padding: 0; }
        .grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 0;
            border-top: 1px dashed #999;
            border-left: 1px dashed #999;
        }
        .ticket {
            border-bottom: 1px dashed #999;
            border-right: 1px dashed #999;
            box-sizing: border-box;
            padding: 5px;
            text-align: center;
            height: 25mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .draw-name { font-size: 8px; font-weight: bold; color: #555; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
        .number { font-size: 16px; font-weight: bold; font-family: monospace; }
        .user-name { font-size: 8px; color: #333; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
@foreach ($chunks as $pageIndex => $pageTickets)
    <div class="grid {{ !$loop->last ? 'page-break' : '' }}">
        @foreach ($pageTickets as $t)
            <div class="ticket">
                <div class="number">{{ $t->numero }}</div>
                <div class="user-name">{{ $t->buyer_name ?? 'N/A' }}</div>
            </div>
        @endforeach
    </div>
@endforeach
</body>
</html>
