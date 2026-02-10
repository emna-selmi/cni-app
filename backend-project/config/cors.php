<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to modify these settings as needed.
    |
    */

    'paths' => ['api/*', 'login', 'logout'], // On cible toutes les routes API

    'allowed_methods' => ['*'], // Autorise GET, POST, PUT, DELETE, etc.

    'allowed_origins' => ['http://localhost:4200'], // Ton adresse Angular

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Autorise tous les headers (Content-Type, Authorization, etc.)

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Important pour envoyer le Token JWT

];