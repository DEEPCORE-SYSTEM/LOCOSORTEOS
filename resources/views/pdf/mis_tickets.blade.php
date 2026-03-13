<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mis Tickets</title>
    <style>
        @page {
            size: A4;
            margin: 0.8cm;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
            margin: 0;
            background: #ffffff;
        }

        .page-break {
            page-break-after: always;
        }

        .grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 8px;
        }

        .cell {
            width: 50%;
            vertical-align: top;
        }

        .ticket {
            position: relative;
            height: 6.2cm;
            border: 1px solid #d1fae5;
            border-radius: 20px;
            overflow: hidden;
            background: #f8fff4;
        }

        .glow-top {
            position: absolute;
            top: -18px;
            right: 20px;
            width: 90px;
            height: 90px;
            border-radius: 999px;
            background: #fde68a;
            opacity: 0.45;
        }

        .glow-bottom {
            position: absolute;
            left: -14px;
            bottom: -26px;
            width: 170px;
            height: 90px;
            border-radius: 999px;
            background: #bbf7d0;
            opacity: 0.5;
        }

        .furrows {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 62px;
            opacity: 0.5;
            background-image: repeating-linear-gradient(165deg, rgba(34, 197, 94, 0.18) 0 8px, transparent 8px 18px);
        }

        .watermark {
            position: absolute;
            inset: 0;
            text-align: center;
            padding-top: 2.1cm;
            opacity: 0.06;
        }

        .watermark img {
            width: 86px;
            height: 86px;
            object-fit: contain;
        }

        .content {
            position: relative;
            z-index: 2;
            padding: 8px 12px 9px;
            height: 100%;
            box-sizing: border-box;
        }

        .header {
            width: 100%;
            border-collapse: collapse;
        }

        .logo-box {
            width: 54px;
            height: 54px;
            border: 1px solid #d1fae5;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            text-align: center;
        }

        .logo-box img {
            width: 42px;
            height: 42px;
            object-fit: contain;
            margin-top: 5px;
        }

        .price {
            text-align: right;
        }

        .price span {
            display: inline-block;
            background: #dc2626;
            color: #ffffff;
            font-size: 11px;
            font-weight: bold;
            border-radius: 8px;
            padding: 5px 10px;
        }

        .title-block {
            text-align: center;
            margin-top: 6px;
        }

        .title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1.2;
        }

        .draw-date {
            font-size: 8.5px;
            color: #166534;
            font-weight: bold;
            margin-top: 3px;
        }

        .number-box {
            margin: 7px auto 0;
            width: 84%;
            text-align: center;
            padding: 8px 8px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.8);
            background: rgba(255, 255, 255, 0.78);
        }

        .number-box strong {
            font-size: 22px;
            letter-spacing: 2px;
        }

        .footer {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-top: 7px;
        }

        .footer-copy {
            padding-right: 6px;
            vertical-align: top;
        }

        .footer-label {
            font-size: 9px;
            font-weight: bold;
            color: #475569;
            line-height: 1.1;
        }

        .footer-link {
            font-size: 8.5px;
            font-weight: bold;
            color: #166534;
            word-break: break-all;
            line-height: 1.1;
        }

        .qr-box {
            width: 62px;
            height: 62px;
            padding: 4px;
            box-sizing: border-box;
            border-radius: 12px;
            border: 1px solid #d1fae5;
            background: rgba(255, 255, 255, 0.92);
            text-align: center;
            line-height: 0;
            margin-left: auto;
        }

        .qr-box img {
            display: block;
            width: 52px;
            height: 52px;
            margin: 0 auto;
        }

        .qr-cell {
            width: 70px;
            text-align: right;
            vertical-align: top;
        }
    </style>
</head>
<body>
@foreach ($pages as $page)
    <table class="grid {{ !$loop->last ? 'page-break' : '' }}">
        @foreach (array_chunk($page, 2) as $row)
            <tr>
                @foreach ($row as $numero)
                    <td class="cell">
                        <div class="ticket">
                            <div class="glow-top"></div>
                            <div class="glow-bottom"></div>
                            <div class="furrows"></div>
                            <div class="watermark">
                                <img src="{{ $logoPath }}" alt="">
                            </div>

                            <div class="content">
                                <table class="header">
                                    <tr>
                                        <td>
                                            <div class="logo-box">
                                                <img src="{{ $logoPath }}" alt="CampoAgro">
                                            </div>
                                        </td>
                                        <td class="price">
                                            @if($compra->sorteo?->precio_ticket !== null)
                                                <span>S/ {{ number_format((float) $compra->sorteo->precio_ticket, 2) }}</span>
                                            @endif
                                        </td>
                                    </tr>
                                </table>

                                <div class="title-block">
                                    <div class="title">{{ $compra->sorteo?->nombre ?? 'Sorteo' }}</div>
                                    @if(!empty($compra->sorteo?->fecha_sorteo) || !empty($compra->sorteo?->fecha_fin))
                                        <div class="draw-date">
                                            Sorteo: {{ \Carbon\Carbon::parse($compra->sorteo->fecha_sorteo ?? $compra->sorteo->fecha_fin)->format('d/m/Y H:i') }}
                                        </div>
                                    @endif
                                    <div class="number-box">
                                        <strong>Nº {{ $numero }}</strong>
                                    </div>
                                </div>

                                <table class="footer">
                                    <tr>
                                        <td class="footer-copy">
                                            <div class="footer-label">Transmisión en vivo por:</div>
                                            <div class="footer-link">{{ $liveLink }}</div>
                                        </td>
                                        <td class="qr-cell">
                                            <div class="qr-box">
                                                <img src="{{ $qrUrl }}" alt="QR">
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </td>
                @endforeach

                @if(count($row) === 1)
                    <td class="cell"></td>
                @endif
            </tr>
        @endforeach
    </table>
@endforeach
</body>
</html>
