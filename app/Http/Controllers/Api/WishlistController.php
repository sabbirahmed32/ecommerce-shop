<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Traits\ApiResponse;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $items = Wishlist::where('user_id', $request->user()->id)
            ->with('product.category')
            ->get();

        $products = $items->map->product->filter(fn ($p) => $p && $p->status);

        return $this->success([
            'products' => ProductResource::collection($products),
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $product = Product::active()->findOrFail($request->product_id);

        $exists = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($exists) {
            $exists->delete();
            $added = false;
            $message = 'Removed from wishlist.';
        } else {
            Wishlist::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
            ]);
            $added = true;
            $message = 'Added to wishlist.';
        }

        $ids = Wishlist::where('user_id', $request->user()->id)->pluck('product_id');

        return $this->success([
            'added' => $added,
            'wishlist_ids' => $ids,
        ], $message);
    }

    public function remove(Request $request, Product $product): JsonResponse
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        $ids = Wishlist::where('user_id', $request->user()->id)->pluck('product_id');

        return $this->success([
            'wishlist_ids' => $ids,
        ], 'Removed from wishlist.');
    }
}
