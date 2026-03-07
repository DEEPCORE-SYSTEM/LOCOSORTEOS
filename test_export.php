<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$sorteo = App\Models\Sorteo::first();
if(!$sorteo) die("No sorteo\n");

$request = Illuminate\Http\Request::create('/admin/tickets/export-pdf', 'POST', [
    'sorteo_id' => $sorteo->id,
    'desde' => 50,
    'hasta' => 75,
    'vendedor' => 'Test Vendedor Final',
    'formato' => 'pdf'
]);

auth()->login(App\Models\User::where('is_admin', true)->first());

$controller = app(App\Http\Controllers\Admin\TicketValidationController::class);
try {
    $response = $controller->exportPdf($request);
    echo "Success! Response Type: " . get_class($response) . "\n";
    if (method_exists($response, 'getContent')) {
        echo "Response Content:\n";
        print_r(json_decode($response->getContent(), true));
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
