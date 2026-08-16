<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CartStoreRequest;
use App\Http\Requests\CartUpdateRequest;
use App\Http\Resources\CartItemResource;
use App\Http\Traits\ApiResponse;
use App\Models\CartCoupon;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    use ApiResponse;

    public const SHIPPING_FEE = 5.99;
    public const FREE_SHIPPING_THRESHOLD = 100;
    public const TAX_RATE = 0.08;

    public function index(Request $request): JsonResponse
    {
        $items = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->with('product')
            ->get();

        return $this->success($this->cartPayload($items, $this->appliedCoupon($request->user()->id)));
    }

    public function store(CartStoreRequest $request): JsonResponse
    {
        $user = $request->user();
        $product = Product::active()->findOrFail($request->product_id);

        if ($product->stock <= 0) {
            return $this->error('This product is out of stock.', 422);
        }

        $item = CartItem::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->where('color', $request->color)
            ->where('size', $request->size)
            ->first();

        if ($item) {
            $newQuantity = $item->quantity + $request->quantity;
            if ($newQuantity > $product->stock) {
                return $this->error("Only {$product->stock} units available in stock.", 422);
            }
            $item->update(['quantity' => $newQuantity]);
        } else {
            if ($request->quantity > $product->stock) {
                return $this->error("Only {$product->stock} units available in stock.", 422);
            }
            $item = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'color' => $request->color,
                'size' => $request->size,
            ]);
        }

        $items = $this->getCartItems($user->id);

        return $this->success($this->cartPayload($items, $this->appliedCoupon($user->id)), 'Product added to cart.');
    }

    public function update(CartUpdateRequest $request, CartItem $cartItem): JsonResponse
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return $this->error('Cart item not found.', 404);
        }

        if ($request->quantity > $cartItem->product->stock) {
            return $this->error("Only {$cartItem->product->stock} units available in stock.", 422);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        $items = $this->getCartItems($request->user()->id);

        return $this->success($this->cartPayload($items, $this->appliedCoupon($request->user()->id)), 'Cart updated.');
    }

    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return $this->error('Cart item not found.', 404);
        }

        $cartItem->delete();

        $items = $this->getCartItems($request->user()->id);

        return $this->success($this->cartPayload($items, $this->appliedCoupon($request->user()->id)), 'Item removed from cart.');
    }

    public function clear(Request $request): JsonResponse
    {
        CartItem::where('user_id', $request->user()->id)->delete();
        CartCoupon::where('user_id', $request->user()->id)->delete();

        return $this->success($this->cartPayload(collect(), null), 'Cart cleared.');
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $user = $request->user();
        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (! $coupon) {
            throw ValidationException::withMessages([
                'code' => ['Coupon code is invalid.'],
            ]);
        }

        $items = $this->getCartItems($user->id);

        if ($items->isEmpty()) {
            throw ValidationException::withMessages([
                'code' => ['Your cart is empty.'],
            ]);
        }

        $subtotal = $items->sum(fn ($item) => $item->product->price * $item->quantity);

        if (! $coupon->isValidFor($subtotal)) {
            if ($coupon->min_subtotal && $subtotal < $coupon->min_subtotal) {
                throw ValidationException::withMessages([
                    'code' => ["This coupon requires a minimum subtotal of $" . number_format($coupon->min_subtotal, 2) . '.' ],
                ]);
            }

            throw ValidationException::withMessages([
                'code' => ['This coupon is no longer valid.'],
            ]);
        }

        CartCoupon::updateOrCreate(
            ['user_id' => $user->id],
            ['coupon_id' => $coupon->id]
        );

        return $this->success($this->cartPayload($items, $coupon), 'Coupon applied successfully.');
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        CartCoupon::where('user_id', $request->user()->id)->delete();

        $items = $this->getCartItems($request->user()->id);

        return $this->success($this->cartPayload($items, null), 'Coupon removed.');
    }

    protected function appliedCoupon(int $userId): ?Coupon
    {
        return CartCoupon::where('user_id', $userId)->first()?->coupon;
    }

    protected function getCartItems(int $userId)
    {
        return CartItem::where('user_id', $userId)->with('product')->get();
    }

    protected function cartPayload($items, ?Coupon $coupon = null): array
    {
        $subtotal = $items->sum(fn ($item) => $item->product->price * $item->quantity);

        if ($coupon && $coupon->isValidFor($subtotal)) {
            $discount = $coupon->discountFor($subtotal);
        } else {
            $discount = 0;
            $coupon = null;
        }

        $afterDiscount = round($subtotal - $discount, 2);
        $shipping = $afterDiscount >= self::FREE_SHIPPING_THRESHOLD ? 0 : self::SHIPPING_FEE;
        $tax = round($afterDiscount * self::TAX_RATE, 2);
        $total = round($afterDiscount + $shipping + $tax, 2);

        return [
            'items' => CartItemResource::collection($items),
            'count' => $items->sum('quantity'),
            'subtotal' => round($subtotal, 2),
            'coupon_code' => $coupon?->code,
            'discount' => round($discount, 2),
            'shipping' => round($shipping, 2),
            'tax' => round($tax, 2),
            'total' => $total,
        ];
    }
}
