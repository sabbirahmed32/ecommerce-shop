<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Traits\ApiResponse;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Order::with('items')->with('user:id,name,email');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', '%' . $request->query('search') . '%')
                    ->orWhere('shipping_name', 'like', '%' . $request->query('search') . '%')
                    ->orWhere('shipping_email', 'like', '%' . $request->query('search') . '%');
            });
        }

        $orders = $query->orderByDesc('created_at')->paginate(10)->withQueryString();

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

    public function show(Order $order): JsonResponse
    {
        return $this->success([
            'order' => new OrderResource($order->load('items', 'user')),
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', Rule::in([
                Order::STATUS_PENDING,
                Order::STATUS_PROCESSING,
                Order::STATUS_SHIPPED,
                Order::STATUS_DELIVERED,
                Order::STATUS_CANCELLED,
            ])],
        ]);

        if ($order->status === Order::STATUS_CANCELLED) {
            return $this->error('This order is already cancelled.', 422);
        }

        $order->update(['status' => $request->status]);

        return $this->success([
            'order' => new OrderResource($order->fresh()->load('items')),
        ], 'Order status updated.');
    }
}
