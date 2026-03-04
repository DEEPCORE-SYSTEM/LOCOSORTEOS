<?php
use Illuminate\Support\Facades\Artisan;
use Spatie\LaravelPdf\Facades\Pdf;

Artisan::command('test:pdf', function () {
    try {
        Pdf::html('<h1>Hello World</h1>')->save('test.pdf');
        $this->info("PDF saved successfully to test.pdf");
    } catch (\Exception $e) {
        $this->error("Error: " . $e->getMessage());
    }
});
