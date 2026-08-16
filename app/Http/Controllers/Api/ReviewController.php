<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Http\Traits\ApiResponse;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    use ApiResponse;

    public function index(Product $product): JsonResponse
    {
        $reviews = $product->reviews()
            ->with('user')
            ->orderByDesc('created_at')
            ->get();

        $ratingCounts = $reviews->groupBy('rating')
            ->map(fn ($group) => $group->count())
            ->toArray();

        return $this->success([
            'reviews' => ReviewResource::collection($reviews),
            'summary' => [
                'average' => $product->rating_avg,
                'total' => $product->rating_count,
                'counts' => [
                    1 => $ratingCounts[1] ?? 0,
                    2 => $ratingCounts[2] ?? 0,
                    3 => $ratingCounts[3] ?? 0,
                    4 => $ratingCounts[4] ?? 0,
                    5 => $ratingCounts[5] ?? 0,
                ],
            ],
        ]);
    }

    public function store(ReviewRequest $request, Product $product): JsonResponse
    {
        if (! $product->status) {
            return $this->error('Product not found.', 404);
        }

        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            return $this->error('You have already reviewed this product.', 422);
        }

        $review = DB::transaction(function () use ($request, $product): Review {
            $review = Review::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);

            $avg = $product->reviews()->avg('rating');
            $count = $product->reviews()->count();

            $product->update([
                'rating_avg' => round((float) $avg, 2),
                'rating_count' => $count,
            ]);

            return $review->load('user');
        });

        return $this->success([
            'review' => new ReviewResource($review),
        ], 'Review submitted successfully.', 201);
    }
}
