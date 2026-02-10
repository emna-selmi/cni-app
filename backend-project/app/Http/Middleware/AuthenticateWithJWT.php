<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthenticateWithJWT
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            if (! $user) {
                return response()->json(['error' => 'Utilisateur introuvable'], 404);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        return $next($request);
    }
}



