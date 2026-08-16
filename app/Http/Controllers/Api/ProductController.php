<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Traits\ApiResponse;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $sortMap = [
            'newest' => ['created_at', 'desc'],
            'price_low' => ['price', 'asc'],
            'price_high' => ['price', 'desc'],
            'rating' => ['rating_avg', 'desc'],
            'popularity' => ['rating_count', 'desc'],
        ];

        [$sortCol, $sortDir] = $sortMap[$request->query('sort', 'newest')] ?? $sortMap['newest'];

        $query = Product::query()
            ->active()
            ->with('category')
            ->search($request->query('search'))
            ->byCategory($request->query('category'))
            ->byBrand($request->query('brand'))
            ->minRating($request->query('min_rating'));

        if ($request->boolean('featured')) {
            $query->featured();
        }

        if ($request->boolean('in_stock')) {
            $query->inStock();
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->query('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->query('max_price'));
        }

        if ($request->filled('price_range')) {
            $range = explode('-', (string) $request->query('price_range'));
            if (count($range) === 2) {
                $query->whereBetween('price', [(float) $range[0], (float) $range[1]]);
            }
        }

        $products = $query
            ->orderBy($sortCol, $sortDir)
            ->paginate((int) $request->query('per_page', 12))
            ->withQueryString();

        $brands = Product::query()
            ->active()
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->selectRaw('brand, count(*) as total')
            ->groupBy('brand')
            ->orderByDesc('total')
            ->get();

        return $this->success([
            'products' => ProductResource::collection($products),
            'brands' => $brands->map(fn ($b) => ['name' => $b->brand, 'count' => $b->total])->values(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->active()
            ->with(['category', 'reviews.user'])
            ->where('slug', $slug)
            ->first();

        if (! $product) {
            return $this->error('Product not found.', 404);
        }

        $related = Product::query()
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->inStock()
            ->limit(4)
            ->get();

        return $this->success([
            'product' => new ProductResource($product),
            'related_products' => ProductResource::collection($related),
        ]);
    }

    public function bestSellers(): JsonResponse
    {
        $products = Product::query()
            ->active()
            ->with('category')
            ->orderByDesc('rating_count')
            ->limit(8)
            ->get();

        return $this->success([
            'products' => ProductResource::collection($products),
        ]);
    }
}
