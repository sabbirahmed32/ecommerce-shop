<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand',
        'name',
        'slug',
        'description',
        'specifications',
        'colors',
        'sizes',
        'price',
        'compare_price',
        'stock',
        'sku',
        'image',
        'images',
        'featured',
        'status',
        'rating_avg',
        'rating_count',
    ];

    protected $casts = [
        'price' => 'float',
        'compare_price' => 'float',
        'images' => 'array',
        'specifications' => 'array',
        'colors' => 'array',
        'sizes' => 'array',
        'featured' => 'boolean',
        'status' => 'boolean',
        'rating_avg' => 'float',
        'rating_count' => 'integer',
    ];

    protected $appends = ['in_stock', 'discount_percent'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', true);
    }

    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('stock', '>', 0);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('featured', true);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (!$term) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->orWhere('sku', 'like', "%{$term}%");
        });
    }

    public function scopeByCategory(Builder $query, ?string $slug): Builder
    {
        if (!$slug) {
            return $query;
        }

        return $query->whereHas('category', fn ($q) => $q->where('slug', $slug));
    }

    public function scopeByBrand(Builder $query, ?string $brand): Builder
    {
        if (!$brand) {
            return $query;
        }

        return $query->where('brand', $brand);
    }

    public function scopeMinRating(Builder $query, ?string $rating): Builder
    {
        if (!$rating) {
            return $query;
        }

        return $query->where('rating_avg', '>=', (float) $rating);
    }

    public function getInStockAttribute(): bool
    {
        return $this->stock > 0;
    }

    public function getDiscountPercentAttribute(): ?int
    {
        if ($this->compare_price && $this->compare_price > $this->price) {
            return (int) round((($this->compare_price - $this->price) / $this->compare_price) * 100);
        }

        return null;
    }

    public function getAllImagesAttribute(): array
    {
        $images = collect($this->images ?? []);
        if ($this->image) {
            $images->prepend($this->image);
        }

        return $images->unique()->values()->all();
    }

    protected function getArrayableAppends(): array
    {
        return array_merge(parent::getArrayableAppends(), ['all_images']);
    }
}
