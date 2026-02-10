<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\NotificationController; 


use App\Http\Controllers\Api\ChatController;

// Remplace 'auth:api' par 'auth:sanctum' si tu n'utilises pas JWT
Route::middleware('auth:api')->group(function () {
    Route::prefix('chat')->group(function () {
        Route::get('/history', [ChatController::class, 'getHistory']);
        Route::post('/new', [ChatController::class, 'startNewChat']);
        Route::post('/{id}/send', [ChatController::class, 'sendMessage']);
        Route::delete('/{id}', [ChatController::class, 'deleteConversation']);
    });
});
/*
|--------------------------------------------------------------------------
| AUTHENTIFICATION PUBLIQUE
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| ROUTES PROTÉGÉES (AUTH:API)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {

    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
    
    // Profil, Liste globale & Déconnexion
    Route::get('/me', [AuthController::class, 'me']); 
    Route::get('/users', [AuthController::class, 'index']); // <--- Mise à jour ici
    Route::post('/logout', [AuthController::class, 'logout']);

    // ================= GESTION ADMIN DES USERS =================
    // Note : On garde UserController pour les actions spécifiques d'administration
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // ================= PROJECTS =================
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);


    // ================= PROJECT COMMENTS (DISCUSSION) =================
Route::get('/projects/{id}/logs', [ProjectController::class, 'getLogs']);
Route::get('/projects/{id}/comments', [ProjectController::class, 'getComments']);
Route::post('/projects/{id}/comments', [ProjectController::class, 'postComment']);


    // ======= GESTION DES MEMBRES DU PROJET =======
    Route::prefix('projects')->group(function () {
        Route::get('{id}/members', [ProjectController::class, 'getMembers']);
        Route::post('{id}/members', [ProjectController::class, 'addMember']);
        Route::delete('{id}/members/{userId}', [ProjectController::class, 'removeMember']);
    });

    // ================= TASKS =================
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']); 
    Route::put('/tasks/{id}', [TaskController::class, 'update']); 
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    
    Route::post('/tasks/{id}/comment', [TaskController::class, 'addComment']); 
    
    
    Route::get('/projects/{id}/tasks', [TaskController::class, 'getTasksByProject']);
    Route::put('/tasks/{id}/status', [TaskController::class, 'updateStatus']); 
    Route::put('/tasks/{id}/assign', [TaskController::class, 'assignTask']); 
    Route::post('/tasks/{id}/comment', [TaskController::class, 'addComment']);

    // ================= NOTIFICATIONS =================
    Route::get('/notifications', [App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    
});