<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'color' => $this->color,
            'size' => $this->size,
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'image' => $this->product->image,
                'price' => $this->product->price,
                'compare_price' => $this->product->compare_price,
                'stock' => $this->product->stock,
                'in_stock' => $this->product->in_stock,
            ],
            'line_total' => round($this->product->price * $this->quantity, 2),
        ];
    }
}
