<?php

declare(strict_types=1);

return [
    'api_key' => env('GEMINI_API_KEY'),
    'model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
    'base_url' => env('GEMINI_BASE_URL'),
    'request_timeout' => env('GEMINI_REQUEST_TIMEOUT', 30),
];

