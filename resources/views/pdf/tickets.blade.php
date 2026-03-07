<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Talonario de Tickets</title>
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: white;
            margin: 0;
            padding: 0;
        }
        .page-break {
            page-break-after: always;
        }
        .container {
            width: 100%;
            padding: 20px 30px;
        }
        /* Grid system for DOMPDF (using inline-block) */
        .ticket-wrapper {
            width: 48%;
            display: inline-block;
            margin-bottom: 20px;
            vertical-align: top;
        }
        .ticket-wrapper:nth-child(odd) {
            margin-right: 2%;
        }
        
        .ticket {
            border: 2px solid #cbd5e1;
            border-radius: 8px;
            height: 195px;
            width: 100%;
            display: block;
            position: relative;
        }
        
        .stub {
            float: left;
            width: 30%;
            height: 100%;
            border-right: 2px dashed #cbd5e1;
            background-color: #f8fafc;
            box-sizing: border-box;
            padding: 10px;
            position: relative;
        }
        
        .main {
            float: right;
            width: 67%;
            height: 100%;
            box-sizing: border-box;
            padding: 12px;
            position: relative;
        }
        
        p { margin: 0; padding: 0; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
        .uppercase { text-transform: uppercase; }
        
        .talon-title { font-size: 9px; color: #94a3b8; }
        .talon-number { font-size: 15px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 5px; margin-top: 5px; }
        .talon-field { font-size: 9px; color: #94a3b8; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; margin-top: 6px; }
        .talon-signature { font-size: 9px; color: #94a3b8; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 4px; }
        
        .brand-box { background: #fbbf24; padding: 2px 5px; border-radius: 4px; display: inline-block; vertical-align: middle; }
        .brand-text { font-size: 11px; font-style: italic; color: #0f172a; display: inline-block; vertical-align: middle; margin-left: 5px; line-height: 1; }
        .brand-accent { color: #059669; }
        .price-tag { float: right; background: #dc2626; color: white; font-size: 11px; padding: 3px 8px; border-radius: 4px; }
        
        .middle-section { margin-top: 20px; text-align: center; }
        .sorteo-name { font-size: 14px; color: #0f172a; overflow: hidden; height: 18px; line-height: 18px; }
        .sorteo-prizes { font-size: 10px; color: #047857; margin-top: 5px; }
        .ticket-number { font-size: 28px; font-family: monospace; color: #1e293b; letter-spacing: 2px; margin-top: 15px; border-top: 1px dotted #cbd5e1; border-bottom: 1px dotted #cbd5e1; padding: 8px 0; }
        
        .footer-section { position: absolute; bottom: 12px; width: 100%; right: 10px;}
        .footer-text { float: left; width: 65%; margin-top: 10px;}
        .transmission-text { font-size: 9px; color: #64748b; }
        .handle-text { font-size: 10px; color: #2563eb; }
        .qr-code { float: right; width: 50px; height: 50px;}
        
        .scissors {
            position: absolute;
            right: -6px;
            top: 50%;
            font-size: 12px;
            color: #cbd5e1;
            background: white;
            line-height: 1;
        }

        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body>

@php
    $linkRedes = \App\Models\SiteSettings::get('link_redes', 'https://facebook.com/SorteosCampoAgroOficial');
    $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' . urlencode($linkRedes);
    $handle = parse_url($linkRedes, PHP_URL_PATH);
    $handle = ltrim($handle ?? $linkRedes, '/');
@endphp

@foreach ($chunks as $pageIndex => $pageNumeros)
    <div class="container {{ !$loop->last ? 'page-break' : '' }}">
        @foreach ($pageNumeros as $num)
            <div class="ticket-wrapper">
                <div class="ticket">
                    <!-- Talón (Stub) -->
                    <div class="stub">
                        <p class="text-center font-bold uppercase talon-title">Talón Vendedor</p>
                        <p class="text-center font-black talon-number">Nº {{ $num }}</p>
                        
                        <div style="margin-top:10px;">
                            <p class="talon-field">Nombre:</p>
                            <p class="talon-field">DNI:</p>
                            <p class="talon-field">Celular:</p>
                        </div>
                        
                        <div style="position: absolute; bottom: 12px; width: 85%;">
                            <p class="text-center talon-signature">Firma/Sello</p>
                            @if($vendedor)
                                <p class="text-center font-bold" style="font-size: 8px; color: #64748b; margin-top:3px; overflow:hidden;">{{ substr($vendedor, 0, 18) }}</p>
                            @endif
                        </div>
                        
                        <div class="scissors">✂</div>
                    </div>

                    <!-- Main Ticket -->
                    <div class="main">
                        <div class="clearfix">
                            <div style="float: left;">
                                <div class="brand-box">
                                    <span style="font-weight:900; color:#064e3b; font-size: 10px;">CA</span>
                                </div>
                                <div class="brand-text font-black uppercase">
                                    Sorteos<br/><span class="brand-accent">CampoAgro</span>
                                </div>
                            </div>
                            <div class="price-tag font-black">
                                S/ {{ number_format($sorteo->precio_ticket, 2) }}
                            </div>
                        </div>

                        <div class="middle-section">
                            <p class="sorteo-name font-black uppercase">{{ substr($sorteo->nombre, 0, 35) }}</p>
                            <p class="sorteo-prizes font-bold">{{ $sorteo->premios->count() }} Premios</p>
                            <p class="ticket-number font-black">Nº {{ $num }}</p>
                        </div>

                        <div class="footer-section clearfix">
                            <div class="footer-text">
                                <p class="transmission-text font-bold">Transmisión en vivo por:</p>
                                <p class="handle-text font-black">{{ substr($handle, 0, 20) }}</p>
                            </div>
                            <img src="{{ $qrUrl }}" class="qr-code" alt="QR Code">
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@endforeach

</body>
</html>
