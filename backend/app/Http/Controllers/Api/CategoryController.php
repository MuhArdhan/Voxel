<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->get();

        return response()->json($categories);
    }

    public function show(Category $category): JsonResponse
    {
        $category->load(['products' => function ($q) {
            $q->where('is_active', true)->with(['images', 'variants']);
        }]);

        return response()->json($category);
    }
}
