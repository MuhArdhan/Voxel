<?php

use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - VOXEL E-Commerce
|--------------------------------------------------------------------------
*/

// ─── Public Routes ──────────────────────────────────────────────────────────

// Auth
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Products (public)
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/slug/{slug}', [ProductController::class, 'showBySlug']);
    Route::get('/{product}', [ProductController::class, 'show']);
});

// Categories (public)
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{category}', [CategoryController::class, 'show']);
});

// Cart (public - supports guest via session)
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/items', [CartController::class, 'addItem']);
    Route::put('/items/{cartItem}', [CartController::class, 'updateItem']);
    Route::delete('/items/{cartItem}', [CartController::class, 'removeItem']);
    Route::delete('/', [CartController::class, 'clear']);
});

// ─── Authenticated User Routes ───────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::put('change-password', [AuthController::class, 'changePassword']);
    });

    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/checkout', [OrderController::class, 'checkout']);
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::post('/{order}/cancel', [OrderController::class, 'cancel']);
    });
});

// ─── Admin Routes ────────────────────────────────────────────────────────────

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'stats']);

    // Categories
    Route::apiResource('categories', AdminCategoryController::class);

    // Products
    Route::prefix('products')->group(function () {
        Route::get('/', [AdminProductController::class, 'index']);
        Route::post('/', [AdminProductController::class, 'store']);
        Route::get('/{product}', [AdminProductController::class, 'show']);
        Route::put('/{product}', [AdminProductController::class, 'update']);
        Route::delete('/{product}', [AdminProductController::class, 'destroy']);
        Route::post('/{product}/restore', [AdminProductController::class, 'restore']);

        // Variants
        Route::post('/{product}/variants', [AdminProductController::class, 'storeVariant']);
        Route::put('/{product}/variants/{variant}', [AdminProductController::class, 'updateVariant']);
        Route::delete('/{product}/variants/{variant}', [AdminProductController::class, 'destroyVariant']);

        // Images
        Route::post('/{product}/images', [AdminProductController::class, 'uploadImages']);
        Route::put('/{product}/images/{image}/primary', [AdminProductController::class, 'setPrimaryImage']);
        Route::delete('/{product}/images/{image}', [AdminProductController::class, 'destroyImage']);
    });

    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index']);
        Route::get('/{order}', [AdminOrderController::class, 'show']);
        Route::put('/{order}/status', [AdminOrderController::class, 'updateStatus']);
    });

    // Users
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index']);
        Route::get('/{user}', [AdminUserController::class, 'show']);
        Route::post('/{user}/toggle-block', [AdminUserController::class, 'toggleBlock']);
    });
});
