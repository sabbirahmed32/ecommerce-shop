<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Traits\ApiResponse;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'brandRel']);

        if ($request->filled('search')) {
            $query->search($request->query('search'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->query('brand_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $products = $query->orderByDesc('created_at')->paginate(10)->withQueryString();

        return $this->success([
            'products' => ProductResource::collection($products),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = Product::create([
            ...$request->validated(),
            'slug' => $this->uniqueSlug($request->slug ?? $request->name),
        ]);

        return $this->success([
            'product' => new ProductResource($product->load(['category', 'brandRel'])),
        ], 'Product created successfully.', 201);
    }

    public function show(Product $product): JsonResponse
    {
        return $this->success([
            'product' => new ProductResource($product->load(['category', 'brandRel'])),
        ]);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        if ($request->filled('slug') && $request->slug !== $product->slug) {
            $data['slug'] = $this->uniqueSlug($request->slug, $product->id);
        }

        $product->update($data);

        return $this->success([
            'product' => new ProductResource($product->fresh()->load(['category', 'brandRel'])),
        ], 'Product updated successfully.');
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return $this->success(null, 'Product deleted successfully.');
    }

    protected function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug);
        $candidate = $base;
        $counter = 1;

        while (Product::where('slug', $candidate)->where('id', '!=', $ignoreId)->exists()) {
            $candidate = $base . '-' . $counter++;
        }

        return $candidate;
    }
}
