<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('order_number', 'like', '%' . $request->search . '%')
                ->orWhereHas('user', fn ($q) => $q->where('name', 'like', '%' . $request->search . '%'));
        }

        $orders = $query->paginate(15);

        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['user', 'items']));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,paid,processing,shipped,completed,cancelled'],
            'tracking_number' => ['nullable', 'string'],
        ]);

        $order->update($validated);

        if ($validated['status'] === 'paid' && ! $order->paid_at) {
            $order->update(['paid_at' => now()]);
        }

        return response()->json(['message' => 'Order status updated', 'order' => $order->fresh(['user', 'items'])]);
    }
}
