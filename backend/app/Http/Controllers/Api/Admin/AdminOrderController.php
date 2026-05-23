<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\BiteshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function __construct(protected BiteshipService $biteship) {}

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
            'status'           => ['required', 'in:pending,paid,processing,shipped,completed,cancelled'],
            'tracking_number'  => ['nullable', 'string'],
        ]);

        $order->update($validated);

        if ($validated['status'] === 'paid' && ! $order->paid_at) {
            $order->update(['paid_at' => now()]);
        }

        return response()->json(['message' => 'Order status updated', 'order' => $order->fresh(['user', 'items'])]);
    }

    public function shipOrder(Order $order): JsonResponse
    {
        if (! in_array($order->status, [Order::STATUS_PAID, Order::STATUS_PROCESSING])) {
            return response()->json(['message' => 'Order must be paid or processing before shipping.'], 422);
        }

        if ($order->tracking_number) {
            return response()->json(['message' => 'Order already has a tracking number.'], 422);
        }

        try {
            $result = $this->biteship->createOrder($order);

            $waybillId = $result['waybill_id'] ?? null;

            $order->update([
                'status'          => Order::STATUS_SHIPPED,
                'tracking_number' => $waybillId ?? ('VXL-' . strtoupper(uniqid())),
            ]);

            return response()->json([
                'message'          => 'Shipment created successfully.',
                'tracking_number'  => $order->tracking_number,
                'biteship_order_id'=> $result['biteship_order_id'] ?? null,
                'order'            => $order->fresh(['user', 'items']),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
