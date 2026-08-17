<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Http\Traits\ApiResponse;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['user:id,name,email', 'product:id,name,image,slug']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('rating')) {
            $query->where('rating', $request->input('rating'));
        }

        if ($search = $request->input('search')) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $reviews = $query->orderByDesc('created_at')->paginate(15);

        return $this->success([
            'reviews' => ReviewResource::collection($reviews),
            'pagination' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function updateStatus(Request $request, Review $review): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,approved,rejected',
        ]);

        $oldStatus = $review->status;
        $review->update(['status' => $request->status]);

        if ($oldStatus !== Review::STATUS_APPROVED && $request->status === Review::STATUS_APPROVED) {
            $this->recalculateProductRatings($review->product);
        } elseif ($oldStatus === Review::STATUS_APPROVED && $request->status !== Review::STATUS_APPROVED) {
            $this->recalculateProductRatings($review->product);
        }

        return $this->success([
            'review' => new ReviewResource($review->fresh()->load('user', 'product')),
        ], 'Review status updated.');
    }

    public function destroy(Review $review): JsonResponse
    {
        $product = $review->product;
        $wasApproved = $review->status === Review::STATUS_APPROVED;

        $review->delete();

        if ($wasApproved) {
            $this->recalculateProductRatings($product);
        }

        return $this->success([], 'Review deleted.');
    }

    protected function recalculateProductRatings(Product $product): void
    {
        $avg = $product->reviews()->approved()->avg('rating');
        $count = $product->reviews()->approved()->count();

        $product->update([
            'rating_avg' => round((float) ($avg ?? 0), 2),
            'rating_count' => $count,
        ]);
    }
}
