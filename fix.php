<?php
$file = 'app/Http/Controllers/Admin/TicketValidationController.php';
$content = file_get_contents($file);
$bad_catch = "} catch (\\Illuminate\\Validation\\ValidationException \$e) { \\Log::error('Validation failed:', \$e->errors()); throw \$e; }";
$content = str_replace($bad_catch, "", $content);
$bad_try = "try { \$request->validate([";
$content = str_replace($bad_try, "\$request->validate([", $content);
file_put_contents($file, $content);
