<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Services\MidtransService;
use App\Services\BiteshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function __construct(
        protected MidtransService $midtrans,
        protected BiteshipService $biteship
    ) {}

    // ─── User: List Orders ────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()
            ->orders()
            ->with(['items.product.images'])
            ->latest();

        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('items', function($itemQuery) use ($search) {
                      $itemQuery->where('product_name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->paginate(10);

        return response()->json($orders);
    }

    // ─── User: Show Single Order ──────────────────────────────────────────────
    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Order not found or you do not have permission to view this order'
            ], 404);
        }

        $order->load(['items.product.images']);

        return response()->json($order);
    }

    // ─── Shipping: Biteship ───────────────────────────────────────────────────
    public function searchAreas(Request $request): JsonResponse
    {
        $query = $request->input('search');
        if (!$query) {
            return response()->json([]);
        }

        $areas = $this->biteship->searchAreas($query);
        return response()->json($areas);
    }

    public function getRates(Request $request): JsonResponse
    {
        $request->validate([
            'destination_area_id' => 'required|string'
        ]);

        $cart = Cart::where('user_id', $request->user()->id)
            ->with(['items.product'])
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 422);
        }

        $items = $cart->items->map(function ($item) {
            return [
                'name'     => $item->product->name,
                'price'    => $item->product->effective_price,
                'weight'   => $item->product->weight,
                'length'   => $item->product->length,
                'width'    => $item->product->width,
                'height'   => $item->product->height,
                'quantity' => $item->quantity,
            ];
        })->toArray();

        try {
            $rates = $this->biteship->getRates($request->input('destination_area_id'), $items);
            return response()->json($rates);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // ─── User: Checkout → Create Order + Get Snap Token ──────────────────────
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_name'        => ['required', 'string', 'max:255'],
            'shipping_phone'       => ['required', 'string', 'max:20'],
            'shipping_address'     => ['required', 'string'],
            'shipping_city'        => ['required', 'string', 'max:100'],
            'shipping_province'    => ['required', 'string', 'max:100'],
            'shipping_postal_code' => ['required', 'string', 'max:10'],
            'destination_area_id'  => ['nullable', 'string'],
            'courier'              => ['required', 'string'],
            'courier_service'      => ['required', 'string'],
            'shipping_cost'        => ['required', 'numeric', 'min:0'],
            'notes'                => ['nullable', 'string'],
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

        // Wrap everything including Midtrans in one transaction
        // so if Midtrans fails, order & cart are rolled back automatically
        $snapData = null;
        $order    = null;

        try {
            [$order, $snapData] = DB::transaction(function () use ($cart, $validated, $request) {
                $subtotal     = $cart->total;
                $shippingCost = $validated['shipping_cost'];
                $totalPrice   = $subtotal + $shippingCost;

                $order = Order::create([
                    'user_id'              => $request->user()->id,
                    'status'               => Order::STATUS_PENDING,
                    'subtotal'             => $subtotal,
                    'shipping_cost'        => $shippingCost,
                    'total_price'          => $totalPrice,
                    'shipping_name'        => $validated['shipping_name'],
                    'shipping_phone'       => $validated['shipping_phone'],
                    'shipping_address'     => $validated['shipping_address'],
                    'shipping_city'        => $validated['shipping_city'],
                    'shipping_province'    => $validated['shipping_province'],
                    'shipping_postal_code' => $validated['shipping_postal_code'],
                    'destination_area_id'  => $validated['destination_area_id'] ?? null,
                    'courier'              => $validated['courier'],
                    'courier_service'      => $validated['courier_service'],
                    'notes'                => $validated['notes'] ?? null,
                ]);

                // Create order items & decrement stock
                foreach ($cart->items as $item) {
                    $unitPrice = $item->product->effective_price + $item->variant->additional_price;
                    $order->items()->create([
                        'product_id'         => $item->product_id,
                        'product_variant_id' => $item->product_variant_id,
                        'product_name'       => $item->product->name,
                        'product_sku'        => $item->product->sku,
                        'variant_size'       => $item->variant->size,
                        'variant_color'      => $item->variant->color,
                        'quantity'           => $item->quantity,
                        'unit_price'         => $unitPrice,
                        'subtotal'           => $unitPrice * $item->quantity,
                    ]);

                    $item->variant->decrement('stock', $item->quantity);
                }

                // Get Midtrans Snap token INSIDE transaction
                // If this throws, everything above is rolled back
                $snapData = $this->midtrans->createSnapToken($order);

                $order->update([
                    'payment_token' => $snapData['snap_token'],
                    'payment_url'   => $snapData['payment_url'],
                ]);

                // Only clear cart after Midtrans succeeds
                $cart->items()->delete();

                return [$order, $snapData];
            });
        } catch (\Exception $e) {
            Log::error('Checkout/Midtrans error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal memproses pembayaran: ' . $e->getMessage(),
            ], 500);
        }

        $order->load('items');

        return response()->json([
            'message'    => 'Order created successfully',
            'order'      => $order,
            'snap_token' => $snapData['snap_token'],
            'client_key' => config('midtrans.client_key'),
        ], 201);
    }

    public function notification(Request $request): JsonResponse
    {
        try {
            $data = $this->midtrans->parseNotification();
            $order = Order::where('order_number', $data['order_number'])->first();

            if (! $order) {
                Log::warning('Midtrans notification for unknown order: ' . $data['order_number']);
                return response()->json(['message' => 'OK - order not in system'], 200);
            }

            $transactionStatus = $data['transaction_status'];
            $fraudStatus       = $data['fraud_status'];
            $paymentType       = $data['payment_type'];

            Log::info("Midtrans notification [{$order->order_number}]: status={$transactionStatus}, fraud={$fraudStatus}");

            if ($transactionStatus === 'capture') {
                if ($fraudStatus === 'challenge') {
                    if (in_array($order->status, [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PENDING])) {
                        $order->update(['status' => Order::STATUS_PENDING]);
                    }
                } elseif ($fraudStatus === 'accept') {
                    if (in_array($order->status, [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PENDING])) {
                        $order->update([
                            'status'         => Order::STATUS_PAID,
                            'payment_method' => $paymentType,
                            'paid_at'        => now(),
                        ]);
                    }
                }
            } elseif ($transactionStatus === 'settlement') {
                if (in_array($order->status, [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PENDING])) {
                    $order->update([
                        'status'         => Order::STATUS_PAID,
                        'payment_method' => $paymentType,
                        'paid_at'        => now(),
                    ]);
                }
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $order->update(['status' => Order::STATUS_CANCELLED]);
            } elseif ($transactionStatus === 'pending') {
                $order->update(['status' => Order::STATUS_PENDING]);
            }

            return response()->json(['message' => 'Notification handled']);

        } catch (\Exception $e) {
            Log::error('Midtrans notification error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing notification'], 500);
        }
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        abort_if($order->user_id !== $request->user()->id, 403);

        if (! in_array($order->status, [Order::STATUS_PENDING])) {
            return response()->json(['message' => 'Order cannot be cancelled at this stage'], 422);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $item->variant->increment('stock', $item->quantity);
            }
            $order->update(['status' => Order::STATUS_CANCELLED]);
        });

        return response()->json(['message' => 'Order cancelled successfully', 'order' => $order->fresh()]);
    }

    public function complete(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== Order::STATUS_SHIPPED) {
            return response()->json(['message' => 'Only shipped orders can be marked as completed.'], 422);
        }

        $order->update(['status' => Order::STATUS_COMPLETED]);

        return response()->json(['message' => 'Order marked as completed.', 'order' => $order->fresh()]);
    }



    public function tracking(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (! $order->tracking_number) {
            return response()->json(['message' => 'No tracking number available for this order.'], 404);
        }

        try {
            $tracking = $this->biteship->getTracking($order->tracking_number, $order->courier);
            return response()->json($tracking);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
