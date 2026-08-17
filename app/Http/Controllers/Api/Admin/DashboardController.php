<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Traits\ApiResponse;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    public function stats(): JsonResponse
    {
        $totalRevenue = (float) Order::where('status', '!=', Order::STATUS_CANCELLED)->sum('total');
        $pendingOrders = Order::where('status', Order::STATUS_PENDING)->count();
        $deliveredOrders = Order::where('status', Order::STATUS_DELIVERED)->count();
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $activeProducts = Product::where('status', true)->count();
        $lowStock = Product::where('status', true)->where('stock', '<=', 5)->count();
        $outOfStock = Product::where('stock', 0)->count();
        $totalUsers = User::where('role', '!=', 'admin')->count();
        $totalReviews = Review::count();
        $pendingCoupons = Coupon::where('is_active', true)->count();

        $revenueByStatus = Order::select('status', DB::raw('count(*) as count'), DB::raw('sum(total) as revenue'))
            ->groupBy('status')
            ->get();

        $salesByDay = Order::where('created_at', '>=', Carbon::now()->subDays(14))
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'), DB::raw('sum(total) as revenue'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'count' => (int) $row->count,
                'revenue' => (float) $row->revenue,
            ]);

        $monthlyRevenue = collect();
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $revenue = (float) Order::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->where('status', '!=', Order::STATUS_CANCELLED)
                ->sum('total');
            $count = Order::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            $monthlyRevenue->push([
                'month' => $month->format('M Y'),
                'revenue' => $revenue,
                'orders' => $count,
            ]);
        }

        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $recentOrders = Order::with('items')->orderByDesc('created_at')->limit(5)->get();

        $topProducts = Product::withCount(['reviews'])
            ->withSum('orderItems as sold', 'quantity')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        $lowStockProducts = Product::where('status', true)
            ->where('stock', '<=', 5)
            ->orderBy('stock')
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'image' => $p->image,
                'stock' => $p->stock,
                'price' => $p->price,
            ]);

        return $this->success([
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'delivered_orders' => $deliveredOrders,
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock,
                'total_users' => $totalUsers,
                'total_reviews' => $totalReviews,
                'active_coupons' => $pendingCoupons,
            ],
            'revenue_by_status' => $revenueByStatus,
            'sales_by_day' => $salesByDay,
            'monthly_revenue' => $monthlyRevenue,
            'orders_by_status' => $ordersByStatus,
            'recent_orders' => OrderResource::collection($recentOrders),
            'top_products' => $topProducts->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'image' => $p->image,
                'price' => $p->price,
                'sold' => (int) $p->order_items_sum_quantity,
                'stock' => $p->stock,
            ]),
            'low_stock_products' => $lowStockProducts,
        ]);
    }
}
