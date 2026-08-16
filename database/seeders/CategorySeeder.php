<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Cutting-edge gadgets, audio, and smart devices engineered for modern living.',
                'image' => $this->img('photo-1498049794561-7780e7231661'),
            ],
            [
                'name' => 'Fashion',
                'slug' => 'fashion',
                'description' => 'Timeless essentials and statement pieces crafted from premium fabrics.',
                'image' => $this->img('photo-1445205170230-053b83016050'),
            ],
            [
                'name' => 'Footwear',
                'slug' => 'footwear',
                'description' => 'From everyday comfort to performance, step out in style.',
                'image' => $this->img('photo-1460353581641-37baddab0fa2'),
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Watches, bags, sunglasses, and jewelry to complete every look.',
                'image' => $this->img('photo-1523170335258-f5ed11844a49'),
            ],
            [
                'name' => 'Home & Living',
                'slug' => 'home-living',
                'description' => 'Beautifully designed furniture and decor that elevate your space.',
                'image' => $this->img('photo-1555041469-a586c61ea9bc'),
            ],
            [
                'name' => 'Beauty & Care',
                'slug' => 'beauty-care',
                'description' => 'Premium skincare and cosmetics for a radiant, confident you.',
                'image' => $this->img('photo-1596462502278-27bfdc403348'),
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }

    protected function img(string $id): string
    {
        return "https://images.unsplash.com/{$id}?auto=format&fit=crop&w=900&q=80";
    }
}
