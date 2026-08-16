<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Traits\ApiResponse;
use App\Models\Order;
use App\Models\Product;
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
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $activeProducts = Product::where('status', true)->count();
        $lowStock = Product::where('status', true)->where('stock', '<=', 5)->count();
        $totalUsers = User::count();
        $outOfStock = Product::where('stock', 0)->count();

        $revenueByStatus = Order::select('status', DB::raw('count(*) as count'), DB::raw('sum(total) as revenue'))
            ->groupBy('status')
            ->get();

        $salesByDay = Order::where('created_at', '>=', Carbon::now()->subDays(14))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'), DB::raw('sum(total) as revenue'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'count' => (int) $row->count,
                'revenue' => (float) $row->revenue,
            ]);

        $recentOrders = Order::with('items')->orderByDesc('created_at')->limit(5)->get();

        $topProducts = Product::withCount(['reviews'])
            ->withSum('orderItems as sold', 'quantity')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        return $this->success([
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock,
                'total_users' => $totalUsers,
            ],
            'revenue_by_status' => $revenueByStatus,
            'sales_by_day' => $salesByDay,
            'recent_orders' => OrderResource::collection($recentOrders),
            'top_products' => $topProducts->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'image' => $p->image,
                'price' => $p->price,
                'sold' => (int) $p->order_items_sum_quantity,
                'stock' => $p->stock,
            ]),
        ]);
    }
}
