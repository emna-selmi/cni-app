<?php
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome'); // C'est ça qui affiche le logo
});
// Il ne doit RIEN y avoir d'autre ici qui ressemble à "api" ou "login"