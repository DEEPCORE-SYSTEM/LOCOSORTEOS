<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Talonario de Tickets</title>

<style>

@page{
    size:A4;
    margin:0.6cm;
}

body{
    font-family: Arial, Helvetica, sans-serif;
    margin:0;
    color:#2D3748;
}

.page-break{
    page-break-after:always;
}

/* GRID */

.grid{
    width:100%;
    border-collapse:separate;
    border-spacing:0 4px;
}

.cell{
    width:50%;
    height:3.4cm;
    padding:2px;
}

/* TICKET */

.ticket{
    width:9.7cm;
    height:3.3cm;
    border:1px solid #E2E8F0;
    border-radius:10px;
    margin:auto;
    overflow:hidden;
}

/* LAYOUT */

.ticket-table{
    width:100%;
    height:100%;
    border-collapse:collapse;
}

/* STUB */

.stub{
    width:32%;
    background:#F8FAFC;
    border-right:2px dashed #CBD5E1;
    padding:6px;
    font-size:8px;
}

.stub-title{
    text-transform:uppercase;
    color:#94A3B8;
    font-size:7px;
}

.stub-number{
    font-weight:bold;
    font-size:12px;
    border-bottom:1px solid #E5E7EB;
    margin-bottom:4px;
}

.stub-field{
    border-bottom:1px solid #E5E7EB;
    margin-top:4px;
}

.stub-footer{
    margin-top:8px;
    font-size:7px;
    color:#94A3B8;
}

/* MAIN */

.main{
    width:68%;
    padding:5px 8px;
}

/* HEADER */

.header{
    width:100%;
}

.logo{
    background:#ECC94B;
    width:20px;
    height:20px;
    border-radius:4px;
}

.brand{
    font-size:9px;
    font-weight:bold;
}

.brand span{
    display:block;
    font-style:italic;
    color:#16A34A;
}

.price{
    text-align:right;
}

.price span{
    background:#DC2626;
    color:white;
    padding:2px 8px;
    border-radius:5px;
    font-size:9px;
    font-weight:bold;
}

/* TITLE */

.title{
    text-align:center;
    font-size:10px;
    font-weight:bold;
    margin-top:2px;
}

/* NUMBER */

.number{
    text-align:center;
    border-top:1px solid #EDF2F7;
    border-bottom:1px solid #EDF2F7;
    margin-top:2px;
}

.number span{
    font-size:14px;
}

.number strong{
    font-size:26px;
}

/* FOOTER */

.footer{
    width:100%;
    margin-top:2px;
}

.footer-text{
    font-size:8px;
}

.handle{
    font-size:9px;
    font-weight:bold;
    color:#2563EB;
}

.qr{
    text-align:right;
}

.qr img{
    width:32px;
    height:32px;
}

</style>
</head>

<body>

@php
$linkTikTok = \App\Models\SiteSettings::get('tiktok_url');
if(!$linkTikTok){
$linkTikTok='https://tiktok.com/@campoagrooficial';
}

$qrUrl='https://api.qrserver.com/v1/create-qr-code/?size=120x120&data='.urlencode($linkTikTok);

$path=parse_url($linkTikTok,PHP_URL_PATH);
$handle=$path?ltrim($path,'/'):'campoagrooficial';
@endphp


@foreach ($chunks as $pageIndex => $pageNumeros)

<div class="{{ !$loop->last ? 'page-break' : '' }}">

<table class="grid">

@php
$rows=array_chunk($pageNumeros,2);
@endphp

@foreach ($rows as $row)

<tr>

@foreach ($row as $num)

<td class="cell">

<div class="ticket">

<table class="ticket-table">

<tr>

<!-- STUB -->

<td class="stub">

<div class="stub-title">Talonario  </div>

<div class="stub-number">
Nº {{ $num }}
</div>

<div class="stub-field">Nombre:</div>
<div class="stub-field">DNI:</div>
<div class="stub-field">Celular:</div>

<div class="stub-field">Ubicacion:</div>
</td>


<!-- MAIN -->

<td class="main">

<table class="header">

<tr>

<td width="24">
<div class="logo"></div>
</td>

<td class="brand">
SORTEOS
<span>CampoAgro</span>
</td>

<td class="price">
<span>S/ {{ number_format($sorteo->precio_ticket,2) }}</span>
</td>

</tr>

</table>

<div class="title">
{{ $sorteo->nombre }}
</div>

<div class="number">
<span>Nº</span>
<strong>{{ $num }}</strong>
</div>

<table class="footer">

<tr>

<td class="footer-text">
Transmisión en vivo<br>
<span class="handle">{{ $handle }}</span>
</td>

<td class="qr">
<img src="{{ $qrUrl }}">
</td>

</tr>

</table>

</td>

</tr>

</table>

</div>

</td>

@endforeach

@if(count($row)==1)
<td class="cell"></td>
@endif

</tr>

@endforeach

</table>

</div>

@endforeach

</body>
</html>
