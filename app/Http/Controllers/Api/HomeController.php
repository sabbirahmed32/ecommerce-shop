<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Http\Traits\ApiResponse;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->withCount(['products' => fn ($q) => $q->where('status', true)])
            ->whereHas('products', fn ($q) => $q->where('status', true))
            ->limit(6)
            ->get();

        $featured = Product::query()
            ->active()
            ->featured()
            ->inStock()
            ->with('category')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        $newArrivals = Product::query()
            ->active()
            ->inStock()
            ->with('category')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        $bestSellers = Product::query()
            ->active()
            ->with('category')
            ->orderByDesc('rating_count')
            ->limit(8)
            ->get();

        $deals = Product::query()
            ->active()
            ->whereNotNull('compare_price')
            ->whereColumn('compare_price', '>', 'price')
            ->with('category')
            ->orderByRaw('((compare_price - price) / compare_price) DESC')
            ->limit(4)
            ->get();

        $flashSale = Product::query()
            ->active()
            ->whereNotNull('compare_price')
            ->whereColumn('compare_price', '>', 'price')
            ->with('category')
            ->orderByRaw('((compare_price - price) / compare_price) DESC')
            ->orderByDesc('stock')
            ->limit(4)
            ->get();

        return $this->success([
            'categories' => CategoryResource::collection($categories),
            'featured_products' => ProductResource::collection($featured),
            'new_arrivals' => ProductResource::collection($newArrivals),
            'best_sellers' => ProductResource::collection($bestSellers),
            'deals' => ProductResource::collection($deals),
            'flash_sale' => ProductResource::collection($flashSale),
            'flash_sale_ends_at' => now()->addDays(2)->toIso8601String(),
        ]);
    }
}
