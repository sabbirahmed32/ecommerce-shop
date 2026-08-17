<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', '!=', 'admin')->withCount('orders');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_blocked')) {
            $query->where('is_blocked', $request->boolean('is_blocked'));
        }

        $customers = $query->orderByDesc('created_at')->paginate(15);

        return $this->success([
            'customers' => UserResource::collection($customers),
            'pagination' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->loadCount('orders');
        $user->load(['orders' => function ($q) {
            $q->orderByDesc('created_at')->limit(10)->with('items');
        }]);

        return $this->success([
            'customer' => new UserResource($user),
        ]);
    }

    public function toggleBlock(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return $this->error('Cannot block an admin user.', 422);
        }

        $user->update(['is_blocked' => !$user->is_blocked]);

        return $this->success([
            'customer' => new UserResource($user->fresh()),
        ], $user->is_blocked ? 'Customer blocked.' : 'Customer unblocked.');
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return $this->error('Cannot delete an admin user.', 422);
        }

        $user->delete();

        return $this->success(null, 'Customer deleted.');
    }
}
