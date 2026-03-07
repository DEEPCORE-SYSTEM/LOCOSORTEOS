<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/admin/tickets/export-pdf', 'POST', [
    'sorteo_id' => 1,
    'desde' => "0001",
    'hasta' => "0100",
    'formato' => 'pdf',
    'vendedor' => ''
]);

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
