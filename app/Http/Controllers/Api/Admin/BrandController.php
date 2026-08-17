<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BrandRequest;
use App\Http\Resources\BrandResource;
use App\Http\Traits\ApiResponse;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Brand::withCount('products');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $brands = $query->orderBy('name')->paginate(15);

        return $this->success([
            'brands' => BrandResource::collection($brands),
            'pagination' => [
                'current_page' => $brands->currentPage(),
                'last_page' => $brands->lastPage(),
                'per_page' => $brands->perPage(),
                'total' => $brands->total(),
            ],
        ]);
    }

    public function all(): JsonResponse
    {
        $brands = Brand::where('status', true)
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return $this->success([
            'brands' => BrandResource::collection($brands),
        ]);
    }

    public function store(BrandRequest $request): JsonResponse
    {
        $brand = Brand::create([
            ...$request->validated(),
            'slug' => $this->uniqueSlug($request->slug ?? $request->name),
        ]);

        return $this->success([
            'brand' => new BrandResource($brand),
        ], 'Brand created successfully.', 201);
    }

    public function show(Brand $brand): JsonResponse
    {
        return $this->success([
            'brand' => new BrandResource($brand),
        ]);
    }

    public function update(BrandRequest $request, Brand $brand): JsonResponse
    {
        $data = $request->validated();

        if ($request->filled('slug') && $request->slug !== $brand->slug) {
            $data['slug'] = $this->uniqueSlug($request->slug, $brand->id);
        }

        $brand->update($data);

        return $this->success([
            'brand' => new BrandResource($brand->fresh()),
        ], 'Brand updated successfully.');
    }

    public function destroy(Brand $brand): JsonResponse
    {
        if ($brand->products()->exists()) {
            return $this->error('Cannot delete a brand that has products.', 422);
        }

        $brand->delete();

        return $this->success(null, 'Brand deleted successfully.');
    }

    protected function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug);
        $candidate = $base;
        $counter = 1;

        while (Brand::where('slug', $candidate)->where('id', '!=', $ignoreId)->exists()) {
            $candidate = $base . '-' . $counter++;
        }

        return $candidate;
    }
}
