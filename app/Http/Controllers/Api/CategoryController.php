<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Http\Traits\ApiResponse;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->withCount(['products' => fn ($q) => $q->where('status', true)])
            ->get();

        return $this->success([
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $category = Category::withCount('products')->where('slug', $slug)->first();

        if (! $category) {
            return $this->error('Category not found.', 404);
        }

        $products = $category->products()
            ->active()
            ->with('category')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return $this->success([
            'category' => new CategoryResource($category),
            'products' => ProductResource::collection($products),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }
}
