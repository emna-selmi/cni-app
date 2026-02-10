<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->user()->role !== 'Admin') {
            return response()->json(['error' => 'Accès réservé à l’administrateur'], 403);
        }

        return $next($request);
    }
}
