<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash; 

class UserController extends Controller
{
    /**
     * Vérifie si l'utilisateur connecté est Admin
     */
    protected function isAdmin($user)
    {
        return strtolower($user->role) === 'admin';
    }

    /**
     * Lister tous les utilisateurs (Admin only - Point 2.1 CDC)
     */
    public function index()
    {
        $user = auth()->user();

        if (!$this->isAdmin($user)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return response()->json(User::all());
    }

    /**
     * US.6 — Créer un utilisateur (Admin only - Validation Point 5 & 7.1)
     */
    public function store(Request $request)
    {
        $admin = auth()->user();

        if (!$this->isAdmin($admin)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // VALIDATION : Unicité de l'email et longueur du password (Point 5 CDC)
        $validator = Validator::make($request->all(), [
            'nom'      => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email', // Test d'unicité (Section 7.1)
            'password' => 'required|string|min:6',
            'role'     => 'required|in:Admin,Utilisateur'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'nom' => $request->nom,
            'email' => $request->email,
            'password' => Hash::make($request->password), // HACHAGE SECURISE (Section 7.1)
            'role' => $request->role
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user
        ], 201);
    }

    /**
     * Afficher un utilisateur (Admin only)
     */
    public function show($id)
    {
        if (!$this->isAdmin(auth()->user())) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return User::findOrFail($id);
    }

    /**
     * Modifier un utilisateur globalement (Admin only - Point 3 CDC)
     */
    public function update(Request $request, $id)
    {
        $admin = auth()->user();

        if (!$this->isAdmin($admin)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom'      => 'sometimes|string|max:100',
            'email'    => 'sometimes|email|unique:users,email,' . $id . ',id_user',
            'password' => 'sometimes|nullable|string|min:6',
            'role'     => 'sometimes|in:Admin,Utilisateur',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $targetUser = User::findOrFail($id);
        
        $updateData = $request->only(['nom', 'email', 'role']);

        // Si un nouveau mot de passe est fourni, on le hache impérativement
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $targetUser->update($updateData);

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user' => $targetUser
        ]);
    }

    /**
     * Supprimer un utilisateur (Admin only)
     */
    public function destroy($id)
    {
        $admin = auth()->user();

        if (!$this->isAdmin($admin)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($admin->id_user == $id) {
            return response()->json([
                'message' => 'Impossible de supprimer votre propre compte'
            ], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }
}