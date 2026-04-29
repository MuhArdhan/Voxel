<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'user')->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->paginate(15));
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('orders'));
    }

    public function toggleBlock(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot block admin users'], 403);
        }

        $user->update(['is_blocked' => ! $user->is_blocked]);

        return response()->json([
            'message' => $user->is_blocked ? 'User blocked' : 'User unblocked',
            'user' => $user->fresh(),
        ]);
    }
}
