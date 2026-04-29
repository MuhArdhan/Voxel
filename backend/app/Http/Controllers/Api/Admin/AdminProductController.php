<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'images', 'variants'])->withTrashed();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->latest()->paginate(15);

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'material' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'sku' => ['nullable', 'string', 'unique:products,sku'],
            'is_limited_drop' => ['boolean'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'weight' => ['integer', 'min:0'],
            // Variants
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.size' => ['required', 'string'],
            'variants.*.color' => ['nullable', 'string'],
            'variants.*.stock' => ['required', 'integer', 'min:0'],
            'variants.*.additional_price' => ['numeric', 'min:0'],
            // Images
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:4096'],
            'primary_image_index' => ['nullable', 'integer'],
        ]);

        $product = DB::transaction(function () use ($request, $validated) {
            $product = Product::create(array_except_keys($validated, ['variants', 'images', 'primary_image_index']));

            // Create variants
            foreach ($validated['variants'] as $variantData) {
                $product->variants()->create($variantData);
            }

            // Upload images
            if ($request->hasFile('images')) {
                $primaryIndex = $validated['primary_image_index'] ?? 0;
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('products', 'public');
                    $product->images()->create([
                        'image_path' => $path,
                        'is_primary' => $index === (int) $primaryIndex,
                        'sort_order' => $index,
                    ]);
                }
            }

            return $product;
        });

        $product->load(['category', 'images', 'variants']);

        return response()->json(['message' => 'Product created', 'product' => $product], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load(['category', 'images', 'variants']));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'material' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'sku' => ['nullable', 'string', 'unique:products,sku,' . $product->id],
            'is_limited_drop' => ['boolean'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'weight' => ['integer', 'min:0'],
        ]);

        $product->update($validated);

        return response()->json(['message' => 'Product updated', 'product' => $product->fresh(['category', 'images', 'variants'])]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete(); // soft delete
        return response()->json(['message' => 'Product deleted']);
    }

    public function restore(int $id): JsonResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();
        return response()->json(['message' => 'Product restored', 'product' => $product]);
    }

    // --- Variant Management ---

    public function storeVariant(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'size' => ['required', 'string'],
            'color' => ['nullable', 'string'],
            'stock' => ['required', 'integer', 'min:0'],
            'additional_price' => ['numeric', 'min:0'],
        ]);

        $variant = $product->variants()->create($validated);

        return response()->json(['message' => 'Variant added', 'variant' => $variant], 201);
    }

    public function updateVariant(Request $request, Product $product, ProductVariant $variant): JsonResponse
    {
        abort_if($variant->product_id !== $product->id, 404);

        $validated = $request->validate([
            'size' => ['sometimes', 'string'],
            'color' => ['nullable', 'string'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'additional_price' => ['numeric', 'min:0'],
        ]);

        $variant->update($validated);

        return response()->json(['message' => 'Variant updated', 'variant' => $variant->fresh()]);
    }

    public function destroyVariant(Product $product, ProductVariant $variant): JsonResponse
    {
        abort_if($variant->product_id !== $product->id, 404);
        $variant->delete();
        return response()->json(['message' => 'Variant deleted']);
    }

    // --- Image Management ---

    public function uploadImages(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'images' => ['required', 'array'],
            'images.*' => ['image', 'max:4096'],
        ]);

        $uploaded = [];
        $nextOrder = $product->images()->max('sort_order') + 1;

        foreach ($request->file('images') as $index => $image) {
            $path = $image->store('products', 'public');
            $uploaded[] = $product->images()->create([
                'image_path' => $path,
                'is_primary' => false,
                'sort_order' => $nextOrder + $index,
            ]);
        }

        return response()->json(['message' => 'Images uploaded', 'images' => $uploaded], 201);
    }

    public function setPrimaryImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_if($image->product_id !== $product->id, 404);

        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json(['message' => 'Primary image set']);
    }

    public function destroyImage(Product $product, ProductImage $image): JsonResponse
    {
        abort_if($image->product_id !== $product->id, 404);
        $image->delete();
        return response()->json(['message' => 'Image deleted']);
    }
}

// Helper function
if (! function_exists('array_except_keys')) {
    function array_except_keys(array $array, array $keys): array
    {
        return array_diff_key($array, array_flip($keys));
    }
}
