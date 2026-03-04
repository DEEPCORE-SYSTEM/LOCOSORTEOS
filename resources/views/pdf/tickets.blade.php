<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Talonario de Tickets</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
            background-color: white;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        .page-break {
            page-break-after: always;
        }
        .ticket-container {
            width: 100%;
            height: 100%;
            padding: 10mm;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: min-content;
            gap: 5mm;
            align-content: start;
        }
    </style>
</head>
<body>

@php
    $linkRedes = \App\Models\SiteSettings::get('link_redes', 'https://facebook.com/SorteosCampoAgroOficial');
    $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=' . urlencode($linkRedes);
    // Extract display handle from URL
    $handle = parse_url($linkRedes, PHP_URL_PATH);
    $handle = ltrim($handle ?? $linkRedes, '/');
@endphp

@foreach ($chunks as $pageIndex => $pageNumeros)
    <div class="ticket-container {{ !$loop->last ? 'page-break' : '' }}">
        @foreach ($pageNumeros as $num)
            <!-- TICKET EN GRID -->
            <div class="bg-white border-2 border-slate-300 rounded-lg shadow-sm flex flex-row overflow-hidden relative" style="height: 52mm;">
                <!-- Talón (Stub) -->
                <div class="w-1/3 border-r-2 border-dashed border-slate-300 p-2 flex flex-col justify-between relative bg-slate-50">
                    <div>
                        <p class="text-[8px] font-bold text-slate-400 uppercase text-center mb-1">Talón Vendedor</p>
                        <p class="text-xs font-black text-slate-900 text-center mb-1 border-b border-slate-200 pb-1">Nº {{ $num }}</p>
                        <div class="space-y-1 mt-1">
                            <div class="border-b border-slate-300 pb-0.5"><p class="text-[7px] text-slate-400">Nombre:</p></div>
                            <div class="border-b border-slate-300 pb-0.5"><p class="text-[7px] text-slate-400">DNI:</p></div>
                            <div class="border-b border-slate-300 pb-0.5"><p class="text-[7px] text-slate-400">Celular:</p></div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <p class="text-[6px] text-slate-400 text-center">Firma/Sello</p>
                        @if($vendedor)
                            <p class="text-[5px] text-slate-300 text-center mt-1 w-full truncate border-t border-slate-200 pt-0.5">{{ $vendedor }}</p>
                        @endif
                    </div>
                    <!-- Tijera -->
                    <div class="text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 bg-white" style="font-size: 10px;">✂</div>
                </div>

                <!-- Main Ticket -->
                <div class="w-2/3 p-3 flex flex-col relative overflow-hidden">
                    <!-- Watermark -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <svg class="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-1.25 6-7.5 6-10.5M10.5 4.5c.5-1.5 2.5-1.5 3 0 .25 1 2 2.5 3.5 2.5s3.5-1 3.5-3.5S18.5.5 17 2M5 14.5c-.5-1.5-2.5-1.5-3 0-.25 1-2 2.5-3.5 2.5S-5 16-5 13.5 -3 10.5-1.5 12"/></svg>
                    </div>

                    <div class="flex justify-between items-start mb-1 relative z-10">
                        <div class="flex items-center gap-1">
                            <div class="bg-amber-400 p-0.5 rounded">
                                <svg class="w-3 h-3 text-emerald-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 20h10"/><path d="M10 20c5.5-1.25 6-7.5 6-10.5M10.5 4.5c.5-1.5 2.5-1.5 3 0 .25 1 2 2.5 3.5 2.5s3.5-1 3.5-3.5S18.5.5 17 2"/></svg>
                            </div>
                            <span class="text-[9px] font-black italic uppercase text-slate-900 leading-none">Sorteos<br/><span class="text-emerald-600">CampoAgro</span></span>
                        </div>
                        <div class="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            S/ {{ number_format($sorteo->precio_ticket, 2) }}
                        </div>
                    </div>

                    <div class="text-center my-auto relative z-10">
                        <h4 class="text-xs font-black text-slate-900 uppercase leading-tight truncate px-1">{{ $sorteo->nombre }}</h4>
                        <p class="text-[8px] text-emerald-700 font-bold mt-0.5">{{ $sorteo->premios->count() }} Premios</p>
                        <p class="text-xl font-black font-mono text-slate-800 tracking-widest mt-1 border-y border-slate-100 py-0.5">Nº {{ $num }}</p>
                    </div>

                    <div class="flex items-end justify-between mt-1 relative z-10">
                        <div>
                            <p class="text-[6px] text-slate-500 font-bold mb-0.5">Transmisión en vivo por:</p>
                            <p class="text-[7px] font-black text-blue-600 truncate max-w-[90px]">{{ $handle }}</p>
                        </div>
                        <!-- Real QR Code -->
                        <div class="bg-white p-0.5 border border-slate-200 rounded">
                            <img src="{{ $qrUrl }}" alt="QR" class="w-10 h-10" style="width:40px;height:40px;" />
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@endforeach

</body>
</html>

