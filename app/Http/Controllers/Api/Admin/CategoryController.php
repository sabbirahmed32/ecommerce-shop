<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Traits\ApiResponse;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return $this->success([
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = Category::create([
            ...$request->validated(),
            'slug' => $this->uniqueSlug($request->slug ?? $request->name),
        ]);

        return $this->success([
            'category' => new CategoryResource($category),
        ], 'Category created successfully.', 201);
    }

    public function show(Category $category): JsonResponse
    {
        return $this->success([
            'category' => new CategoryResource($category),
        ]);
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();

        if ($request->filled('slug') && $request->slug !== $category->slug) {
            $data['slug'] = $this->uniqueSlug($request->slug, $category->id);
        }

        $category->update($data);

        return $this->success([
            'category' => new CategoryResource($category->fresh()),
        ], 'Category updated successfully.');
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return $this->error('Cannot delete a category that contains products.', 422);
        }

        $category->delete();

        return $this->success(null, 'Category deleted successfully.');
    }

    protected function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug);
        $candidate = $base;
        $counter = 1;

        while (Category::where('slug', $candidate)->where('id', '!=', $ignoreId)->exists()) {
            $candidate = $base . '-' . $counter++;
        }

        return $candidate;
    }
}
