<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($notifications);
    }


    public function markAsRead($id) {
    $notification = Notification::where('id', $id)
        ->where('user_id', auth()->id())
        ->firstOrFail();

    $notification->update(['is_read' => 1]);

    return response()->json(['message' => 'Marquée comme lue']);
}


}