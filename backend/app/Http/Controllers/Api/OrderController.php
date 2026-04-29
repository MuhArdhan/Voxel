<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_if($order->user_id !== $request->user()->id, 403);
        $order->load('items');

        return response()->json($order);
    }

    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['required', 'string', 'max:20'],
            'shipping_address' => ['required', 'string'],
            'shipping_city' => ['required', 'string', 'max:100'],
            'shipping_province' => ['required', 'string', 'max:100'],
            'shipping_postal_code' => ['required', 'string', 'max:10'],
            'courier' => ['required', 'string'],
            'courier_service' => ['required', 'string'],
            'shipping_cost' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $cart = Cart::where('user_id', $request->user()->id)
            ->with(['items.product', 'items.variant'])
            ->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 422);
        }

        // Validate stock
        foreach ($cart->items as $item) {
            if ($item->variant->stock < $item->quantity) {
                return response()->json([
                    'message' => "Insufficient stock for {$item->product->name} ({$item->variant->size}). Available: {$item->variant->stock}",
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($cart, $validated, $request) {
            $subtotal = $cart->total;
            $shippingCost = $validated['shipping_cost'];
            $totalPrice = $subtotal + $shippingCost;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_price' => $totalPrice,
                'shipping_name' => $validated['shipping_name'],
                'shipping_phone' => $validated['shipping_phone'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_province' => $validated['shipping_province'],
                'shipping_postal_code' => $validated['shipping_postal_code'],
                'courier' => $validated['courier'],
                'courier_service' => $validated['courier_service'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items & decrement stock
            foreach ($cart->items as $item) {
                $unitPrice = $item->product->effective_price + $item->variant->additional_price;
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product->name,
                    'product_sku' => $item->product->sku,
                    'variant_size' => $item->variant->size,
                    'variant_color' => $item->variant->color,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $unitPrice * $item->quantity,
                ]);

                // Decrement stock
                $item->variant->decrement('stock', $item->quantity);
            }

            // Clear cart
            $cart->items()->delete();

            return $order;
        });

        $order->load('items');

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order,
        ], 201);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        abort_if($order->user_id !== $request->user()->id, 403);

        if (! in_array($order->status, ['pending'])) {
            return response()->json(['message' => 'Order cannot be cancelled at this stage'], 422);
        }

        DB::transaction(function () use ($order) {
            // Restore stock
            foreach ($order->items as $item) {
                $item->variant->increment('stock', $item->quantity);
            }
            $order->update(['status' => 'cancelled']);
        });

        return response()->json(['message' => 'Order cancelled successfully', 'order' => $order->fresh()]);
    }
}
