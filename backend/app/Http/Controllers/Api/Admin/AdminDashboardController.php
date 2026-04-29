<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total_price');
        $totalOrders = Order::count();
        $totalUsers = User::where('role', 'user')->count();
        $totalProducts = Product::count();

        $recentOrders = Order::with('user')
            ->latest()
            ->take(5)
            ->get();

        $ordersByStatus = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Revenue last 7 days
        $revenueChart = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(total_price) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'total_users' => $totalUsers,
                'total_products' => $totalProducts,
            ],
            'recent_orders' => $recentOrders,
            'orders_by_status' => $ordersByStatus,
            'revenue_chart' => $revenueChart,
        ]);
    }
}
