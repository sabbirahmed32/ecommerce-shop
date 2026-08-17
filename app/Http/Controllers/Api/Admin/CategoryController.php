<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Traits\ApiResponse;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Category::withCount('products');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $categories = $query->orderBy('name')->paginate(15);

        return $this->success([
            'categories' => CategoryResource::collection($categories),
            'pagination' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ],
        ]);
    }

    public function all(): JsonResponse
    {
        $categories = Category::where('status', true)
            ->withCount('products')
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
