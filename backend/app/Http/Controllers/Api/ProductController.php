<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'images', 'variants'])
            ->where('is_active', true);

        // Search
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by category slug
        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        // Filter by price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by size
        if ($request->filled('size')) {
            $query->whereHas('variants', fn ($q) => $q->where('size', $request->size)->where('stock', '>', 0));
        }

        // Filter limited drops
        if ($request->boolean('limited')) {
            $query->where('is_limited_drop', true);
        }

        // Filter featured
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['created_at', 'price', 'name'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $products = $query->paginate($request->input('per_page', 12));

        return response()->json($products);
    }

    public function show(Product $product): JsonResponse
    {
        if (! $product->is_active) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->load(['category', 'images', 'variants']);

        return response()->json($product);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with(['category', 'images', 'variants'])
            ->firstOrFail();

        return response()->json($product);
    }
}
