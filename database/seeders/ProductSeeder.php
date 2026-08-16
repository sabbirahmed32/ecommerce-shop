<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all()->keyBy('slug');

        $products = [
            // Electronics
            ['electronics', 'Aurora Wireless Headphones', 'photo-1505740420928-5e560c06d30e', 199.99, 249.99, 40, 'AUR-HD-001', true, 4.8, 214, 'Aurora'],
            ['electronics', 'Pulse Smart Speaker', 'photo-1545454675-3531b543be5d', 129.00, 159.00, 60, 'PLS-SPK-001', true, 4.6, 96, 'Pulse'],
            ['electronics', 'Nimbus Mechanical Keyboard', 'photo-1587829741301-dc798b83add3', 89.99, null, 75, 'NMB-KB-001', false, 4.7, 132, 'Nimbus'],
            ['electronics', 'ProCam X50 Mirrorless Camera', 'photo-1526170375885-4d8ecf77b99f', 1299.00, 1499.00, 12, 'PRC-CAM-001', true, 4.9, 78, 'ProCam'],
            ['electronics', 'NovaFit Smartwatch Series 7', 'photo-1523275335684-37898b6baf30', 249.00, 299.00, 50, 'NVT-SW-001', true, 4.5, 340, 'NovaFit'],
            ['electronics', 'PixelTouch 5K Monitor 27"', 'photo-1527443224154-c4a3942d3acf', 449.00, null, 25, 'PXT-MON-001', false, 4.6, 54, 'PixelTouch'],
            ['electronics', 'Vantage Wireless Charger', 'photo-1583863788434-e58a36330cf0', 39.99, 59.99, 120, 'VNT-CHG-001', false, 4.4, 187, 'Vantage'],
            ['electronics', 'EchoPro Noise-Cancelling Earbuds', 'photo-1590658268037-6bf12165a8df', 149.00, 179.00, 90, 'ECP-EB-001', true, 4.7, 265, 'EchoPro'],

            // Fashion
            ['fashion', 'Classic Organic Cotton Tee', 'photo-1521572163474-6864f9cf17ab', 24.99, 34.99, 150, 'CLS-TEE-001', true, 4.5, 402, 'Urban'],
            ['fashion', 'Urban Denim Jacket', 'photo-1591047139829-d91aecb6caea', 89.00, 119.00, 45, 'URB-DJ-001', false, 4.7, 158, 'Urban'],
            ['fashion', 'Merino Wool Crew Sweater', 'photo-1576871337622-98d48d1cf531', 79.00, null, 70, 'MRN-SW-001', false, 4.6, 92, 'Merino'],
            ['fashion', 'Slim-Fit Chino Pants', 'photo-1594633312681-425c7b97ccd1', 54.99, 69.99, 110, 'SLM-CHN-001', false, 4.4, 128, 'Urban'],
            ['fashion', 'Aurora Silk Dress', 'photo-1595777457583-95e059d581b8', 129.00, null, 35, 'AUR-DRS-001', true, 4.8, 64, 'Aurora'],
            ['fashion', 'Heritage Wool Overcoat', 'photo-1539533018447-63fcce2678e3', 219.00, 269.00, 20, 'HRT-OVC-001', false, 4.9, 41, 'Heritage'],

            // Footwear
            ['footwear', 'Velocity Running Shoes', 'photo-1542291026-7eec264c27ff', 119.99, 149.99, 80, 'VEL-RN-001', true, 4.7, 512, 'Velocity'],
            ['footwear', 'Everyday Canvas Sneakers', 'photo-1560769629-975ec94e6a86', 59.99, 79.99, 130, 'EVY-SNK-001', true, 4.5, 284, 'Everyday'],
            ['footwear', 'Trail Blazer Hiking Boots', 'photo-1520639888713-7851133b1ed0', 149.00, null, 55, 'TRL-HK-001', false, 4.8, 173, 'TrailBlazer'],
            ['footwear', 'Comfort Slip-On Loafers', 'photo-1533867617858-e7b97e060509', 94.00, 119.00, 65, 'CMF-LOF-001', false, 4.4, 96, 'Comfort'],
            ['footwear', 'Court Classic White Sneakers', 'photo-1549298916-b41d501d3772', 109.00, null, 85, 'CRT-SNK-001', true, 4.6, 231, 'Court'],

            // Accessories
            ['accessories', 'Heritage Leather Watch', 'photo-1524592094714-0f0654e20314', 189.00, 239.00, 40, 'HRT-WT-001', true, 4.8, 156, 'Heritage'],
            ['accessories', 'Travel Duffel Bag 40L', 'photo-1553062407-98eeb64c6a62', 99.00, 129.00, 60, 'TRV-BAG-001', false, 4.6, 112, 'Travel'],
            ['accessories', 'Wayfarer Polarized Sunglasses', 'photo-1511499767150-a48a237f0083', 79.99, 99.99, 95, 'WYF-SG-001', true, 4.5, 198, 'Wayfarer'],
            ['accessories', 'Minimalist Leather Backpack', 'photo-1548036328-c9fa89d128fa', 139.00, null, 48, 'MNM-BP-001', false, 4.7, 87, 'Minimalist'],
            ['accessories', 'Eternity Gold Necklace', 'photo-1535632066927-ab7c9ab60908', 249.00, 329.00, 22, 'ETR-NCK-001', true, 4.9, 73, 'Eternity'],
            ['accessories', 'Classic Silver Chronograph', 'photo-1547996160-81dfa63595aa', 159.00, null, 38, 'CLS-WT-001', false, 4.6, 121, 'Classic'],

            // Home & Living
            ['home-living', 'Nordic Oak Coffee Table', 'photo-1532372320572-cda25653a26d', 299.00, 369.00, 15, 'NRD-CT-001', true, 4.8, 44, 'Nordic'],
            ['home-living', 'Scandinavian Floor Lamp', 'photo-1507473885765-e6ed057f782c', 129.00, null, 30, 'SCN-LMP-001', false, 4.5, 67, 'Scandinavian'],
            ['home-living', 'Velvet Accent Chair', 'photo-1567538096630-e0c55bd6374c', 249.00, 319.00, 18, 'VLV-ACH-001', true, 4.7, 52, 'Velvet'],
            ['home-living', 'Ceramic Pour-Over Set', 'photo-1495474472287-4d71bcdd2085', 49.99, 69.99, 85, 'CRM-CFF-001', false, 4.6, 143, 'Ceramic'],
            ['home-living', 'Linen Throw Blanket', 'photo-1580301762395-24ce36d9bef7', 59.99, null, 70, 'LNN-THW-001', false, 4.4, 89, 'Linen'],
            ['home-living', 'Aromatherapy Diffuser', 'photo-1602928321472-9e58a4862592', 44.99, 59.99, 100, 'ARM-DIF-001', false, 4.5, 176, 'Aroma'],

            // Beauty & Care
            ['beauty-care', 'Lumière Vitamin C Serum', 'photo-1620916566398-39f1143ab7be', 54.00, 69.00, 120, 'LMR-SRM-001', true, 4.7, 234, 'Lumière'],
            ['beauty-care', 'Hydra Glow Facial Kit', 'photo-1570172619644-dfd03ed5d881', 79.00, null, 65, 'HYD-KIT-001', false, 4.6, 98, 'Hydra'],
            ['beauty-care', 'Velvet Matte Lipstick Trio', 'photo-1586495777744-4413f21062fa', 39.99, 54.99, 140, 'VLV-LP-001', true, 4.5, 312, 'Velvet'],
            ['beauty-care', 'Botanical Skincare Set', 'photo-1596462502278-27bfdc403348', 119.00, 149.00, 55, 'BOT-SKN-001', false, 4.8, 124, 'Botanical'],
            ['beauty-care', '24K Gold Eye Serum', 'photo-1629380171577-b1e28f55657c', 64.99, null, 80, 'GLD-EYS-001', false, 4.6, 77, '24K'],
        ];

        $featuredFlags = ['featured' => true, 'not' => false];

        foreach ($products as $index => [$catSlug, $name, $photo, $price, $compare, $stock, $sku, $featured, $rating, $ratingCount, $brand]) {
            $category = $categories[$catSlug] ?? null;
            if (! $category) {
                continue;
            }

            $image = $this->img($photo);

            Product::updateOrCreate(
                ['sku' => $sku],
                [
                    'category_id' => $category->id,
                    'brand' => $brand,
                    'name' => $name,
                    'slug' => Str::slug($name) . ($index < 4 ? '' : ''),
                    'description' => $this->description($name),
                    'specifications' => $this->specsFor($catSlug, $name, $brand, $sku),
                    'colors' => $this->colorsFor($catSlug),
                    'sizes' => $this->sizesFor($catSlug),
                    'price' => $price,
                    'compare_price' => $compare,
                    'stock' => $stock,
                    'image' => $image,
                    'images' => [$image, $this->img($photo, '800'), $this->img($photo, '1200')],
                    'featured' => $featured,
                    'status' => true,
                    'rating_avg' => $rating,
                    'rating_count' => $ratingCount,
                ]
            );
        }
    }

    protected function img(string $id, string $w = '900'): string
    {
        return "https://images.unsplash.com/{$id}?auto=format&fit=crop&w={$w}&q=80";
    }

    protected function description(string $name): string
    {
        return "{$name}. Crafted with premium materials and meticulous attention to detail, this piece blends modern design with everyday practicality. Each unit undergoes rigorous quality checks to ensure it meets the highest standards of durability and performance. Whether for daily use or special occasions, it delivers an exceptional experience. Backed by our 30-day money-back guarantee and free 2-year warranty, shop with complete confidence.";
    }

    protected function colorsFor(string $catSlug): ?array
    {
        $palettes = [
            'electronics' => [
                ['name' => 'Black', 'hex' => '#18181b'],
                ['name' => 'Silver', 'hex' => '#c0c0c0'],
                ['name' => 'Space Gray', 'hex' => '#4b5563'],
                ['name' => 'Gold', 'hex' => '#d4af37'],
            ],
            'fashion' => [
                ['name' => 'Black', 'hex' => '#18181b'],
                ['name' => 'White', 'hex' => '#fafafa'],
                ['name' => 'Navy', 'hex' => '#1e3a8a'],
                ['name' => 'Beige', 'hex' => '#d6c7a8'],
                ['name' => 'Olive', 'hex' => '#6b8e23'],
            ],
            'footwear' => [
                ['name' => 'White', 'hex' => '#fafafa'],
                ['name' => 'Black', 'hex' => '#18181b'],
                ['name' => 'Grey', 'hex' => '#9ca3af'],
                ['name' => 'Tan', 'hex' => '#d2b48c'],
                ['name' => 'Navy', 'hex' => '#1e3a8a'],
            ],
            'accessories' => [
                ['name' => 'Brown', 'hex' => '#7c5a3c'],
                ['name' => 'Black', 'hex' => '#18181b'],
                ['name' => 'Tan', 'hex' => '#d2b48c'],
                ['name' => 'Grey', 'hex' => '#9ca3af'],
            ],
            'home-living' => [
                ['name' => 'Natural', 'hex' => '#d9cbb2'],
                ['name' => 'Oak', 'hex' => '#c98f5a'],
                ['name' => 'Black', 'hex' => '#18181b'],
                ['name' => 'White', 'hex' => '#fafafa'],
            ],
        ];

        return $palettes[$catSlug] ?? null;
    }

    protected function sizesFor(string $catSlug): ?array
    {
        return match ($catSlug) {
            'fashion' => ['XS', 'S', 'M', 'L', 'XL'],
            'footwear' => ['7', '8', '9', '10', '11', '12'],
            default => null,
        };
    }

    protected function specsFor(string $catSlug, string $name, string $brand, string $sku): array
    {
        $base = [
            'Brand' => $brand,
            'Model' => $name,
            'SKU' => $sku,
        ];

        $extra = match ($catSlug) {
            'electronics' => [
                'Category' => 'Electronics',
                'Warranty' => '2-year manufacturer warranty',
                'Connectivity' => 'Bluetooth 5.3 / USB-C',
            ],
            'fashion' => [
                'Category' => 'Fashion',
                'Material' => 'Premium quality fabric',
                'Care' => 'Machine washable, low temperature',
                'Fit' => 'Regular fit',
            ],
            'footwear' => [
                'Category' => 'Footwear',
                'Upper' => 'Premium leather / breathable mesh',
                'Sole' => 'Durable rubber outsole',
                'Size range' => 'US 7 – 12',
            ],
            'accessories' => [
                'Category' => 'Accessories',
                'Material' => 'Genuine leather / premium alloy',
                'Closure' => 'Secure magnetic / buckle closure',
                'Care' => 'Wipe clean with dry cloth',
            ],
            'home-living' => [
                'Category' => 'Home & Living',
                'Material' => 'Solid wood / premium textiles',
                'Assembly' => 'Simple 10-minute assembly',
                'Care' => 'Spot clean as needed',
            ],
            'beauty-care' => [
                'Category' => 'Beauty & Care',
                'Skin type' => 'All skin types',
                'Shelf life' => '12 months after opening',
                'Usage' => 'Apply morning and evening',
            ],
            default => ['Category' => 'General'],
        };

        return [...$base, ...$extra];
    }
}
