<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getCart(Request $request): Cart
    {
        $sessionId = $request->header('X-Session-ID') ?? session()->getId();

        $user = $request->user('sanctum');

        if ($user) {
            $userCart = Cart::firstOrCreate(['user_id' => $user->id]);

            // If there's a guest cart with this session ID, move its items to the user cart
            if ($sessionId) {
                $guestCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();
                if ($guestCart && $guestCart->id !== $userCart->id) {
                    foreach ($guestCart->items as $item) {
                        // Check if item already exists in user cart
                        $existingItem = $userCart->items()
                            ->where('product_id', $item->product_id)
                            ->where('product_variant_id', $item->product_variant_id)
                            ->first();

                        if ($existingItem) {
                            $existingItem->update(['quantity' => $existingItem->quantity + $item->quantity]);
                        } else {
                            $item->update(['cart_id' => $userCart->id]);
                        }
                    }
                    $guestCart->delete(); // Remove abandoned guest cart
                }
            }

            return $userCart;
        }

        // Guest cart
        return Cart::firstOrCreate(['session_id' => $sessionId, 'user_id' => null]);
    }

    public function index(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->load(['items.product.images', 'items.variant']);

        return response()->json([
            'cart_id' => $cart->id,
            'items' => $cart->items,
            'total' => $cart->total,
            'total_items' => $cart->total_items,
        ]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'product_variant_id' => ['required', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $variant = ProductVariant::where('id', $validated['product_variant_id'])
            ->where('product_id', $product->id)
            ->firstOrFail();

        if ($variant->stock < $validated['quantity']) {
            return response()->json(['message' => 'Insufficient stock. Available: ' . $variant->stock], 422);
        }

        $cart = $this->getCart($request);

        $existingItem = $cart->items()
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variant->id)
            ->first();

        if ($existingItem) {
            $newQty = $existingItem->quantity + $validated['quantity'];
            if ($variant->stock < $newQty) {
                return response()->json(['message' => 'Insufficient stock. Available: ' . $variant->stock], 422);
            }
            $existingItem->update(['quantity' => $newQty]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'product_variant_id' => $variant->id,
                'quantity' => $validated['quantity'],
            ]);
        }

        $cart->load(['items.product.images', 'items.variant']);

        return response()->json([
            'message' => 'Item added to cart',
            'cart_id' => $cart->id,
            'items' => $cart->items,
            'total' => $cart->total,
            'total_items' => $cart->total_items,
        ]);
    }

    public function updateItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $this->ensureCartOwnership($request, $cartItem);

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        if ($cartItem->variant->stock < $validated['quantity']) {
            return response()->json(['message' => 'Insufficient stock. Available: ' . $cartItem->variant->stock], 422);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        $cart = $cartItem->cart->load(['items.product.images', 'items.variant']);

        return response()->json([
            'message' => 'Cart updated',
            'items' => $cart->items,
            'total' => $cart->total,
            'total_items' => $cart->total_items,
        ]);
    }

    public function removeItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $this->ensureCartOwnership($request, $cartItem);
        $cart = $cartItem->cart;
        $cartItem->delete();
        $cart->load(['items.product.images', 'items.variant']);

        return response()->json([
            'message' => 'Item removed',
            'items' => $cart->items,
            'total' => $cart->total,
            'total_items' => $cart->total_items,
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);
        $cart->items()->delete();

        return response()->json(['message' => 'Cart cleared']);
    }

    private function ensureCartOwnership(Request $request, CartItem $cartItem): void
    {
        $cart = $this->getCart($request);
        abort_if($cartItem->cart_id !== $cart->id, 403, 'Forbidden');
    }
}
