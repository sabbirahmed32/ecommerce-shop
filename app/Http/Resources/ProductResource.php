<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => $this->brand,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'specifications' => $this->specifications,
            'colors' => $this->colors,
            'sizes' => $this->sizes,
            'price' => $this->price,
            'compare_price' => $this->compare_price,
            'discount_percent' => $this->discount_percent,
            'stock' => $this->stock,
            'in_stock' => $this->in_stock,
            'sku' => $this->sku,
            'image' => $this->image,
            'images' => $this->all_images,
            'featured' => $this->featured,
            'status' => $this->status,
            'rating_avg' => $this->rating_avg,
            'rating_count' => $this->rating_count,
            'created_at' => $this->created_at,
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'review_loaded' => $this->relationLoaded('reviews'),
        ];
    }
}
