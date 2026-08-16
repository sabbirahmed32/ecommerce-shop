<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Http\Traits\ApiResponse;
use App\Models\CartCoupon;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use ApiResponse;

    public const SHIPPING_METHOD_STANDARD = 'standard';
    public const SHIPPING_METHOD_EXPRESS = 'express';

    public const SHIPPING_FEE = 5.99;
    public const EXPRESS_FEE = 12.99;
    public const FREE_SHIPPING_THRESHOLD = 100;
    public const TAX_RATE = 0.08;

    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->orderByDesc('created_at')
            ->paginate(10);

        return $this->success([
            'orders' => OrderResource::collection($orders),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function store(CheckoutRequest $request): JsonResponse
    {
        $user = $request->user();

        $cartItems = CartItem::where('user_id', $user->id)->with('product')->get();

        if ($cartItems->isEmpty()) {
            return $this->error('Your cart is empty.', 422);
        }

        foreach ($cartItems as $item) {
            if (! $item->product->status || $item->product->stock <= 0) {
                return $this->error("\"{$item->product->name}\" is no longer available.", 422);
            }
            if ($item->quantity > $item->product->stock) {
                return $this->error("Only {$item->product->stock} units of \"{$item->product->name}\" are available.", 422);
            }
        }

        $order = DB::transaction(function () use ($user, $cartItems, $request): Order {
            $subtotal = $cartItems->sum(fn ($item) => $item->product->price * $item->quantity);

            $coupon = CartCoupon::where('user_id', $user->id)->first()?->coupon;
            if ($coupon && ! $coupon->isValidFor($subtotal)) {
                $coupon = null;
            }

            $discount = $coupon ? $coupon->discountFor($subtotal) : 0;
            $afterDiscount = round($subtotal - $discount, 2);

            if ($request->shipping_method === self::SHIPPING_METHOD_EXPRESS) {
                $shipping = self::EXPRESS_FEE;
            } else {
                $shipping = $afterDiscount >= self::FREE_SHIPPING_THRESHOLD ? 0 : self::SHIPPING_FEE;
            }

            $tax = round($afterDiscount * self::TAX_RATE, 2);
            $total = round($afterDiscount + $shipping + $tax, 2);

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => Order::STATUS_PENDING,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'coupon_code' => $coupon?->code,
                'shipping' => $shipping,
                'shipping_method' => $request->shipping_method,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cash_on_delivery'
                    ? Order::PAYMENT_UNPAID
                    : Order::PAYMENT_PAID,
                'shipping_name' => $request->shipping_name,
                'shipping_email' => $request->shipping_email,
                'shipping_phone' => $request->shipping_phone,
                'shipping_address' => $request->shipping_address,
                'shipping_city' => $request->shipping_city,
                'shipping_state' => $request->shipping_state,
                'shipping_postal_code' => $request->shipping_postal_code,
                'shipping_country' => $request->shipping_country,
                'notes' => $request->notes,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'product_image' => $item->product->image,
                    'price' => $item->product->price,
                    'quantity' => $item->quantity,
                    'total' => $item->product->price * $item->quantity,
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            if ($coupon) {
                $coupon->increment('used_count');
            }

            CartCoupon::where('user_id', $user->id)->delete();
            CartItem::where('user_id', $user->id)->delete();

            return $order;
        });

        return $this->success([
            'order' => new OrderResource($order->load('items')),
        ], 'Order placed successfully.', 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return $this->error('Order not found.', 404);
        }

        return $this->success([
            'order' => new OrderResource($order->load('items')),
        ]);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return $this->error('Order not found.', 404);
        }

        if (! $order->canCancel()) {
            return $this->error('This order can no longer be cancelled.', 422);
        }

        DB::transaction(function () use ($order) {
            $order->update(['status' => Order::STATUS_CANCELLED]);

            foreach ($order->items as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }
            }
        });

        return $this->success([
            'order' => new OrderResource($order->fresh()->load('items')),
        ], 'Order cancelled successfully.');
    }
}
