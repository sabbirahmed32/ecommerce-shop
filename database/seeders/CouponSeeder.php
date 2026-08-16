<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            ['SAVE10', 'percent', 10, null, null, null, null, true],
            ['WELCOME15', 'percent', 15, 50, null, null, null, true],
            ['FLAT25', 'fixed', 25, 100, 500, null, null, true],
            ['SUMMER20', 'percent', 20, 75, 300, null, '2026-12-31 23:59:59', true],
            ['WINTER10', 'percent', 10, 40, 200, null, '2026-03-01 00:00:00', false],
        ];

        foreach ($coupons as [$code, $type, $value, $min, $maxUses, $startsAt, $expiresAt, $active]) {
            Coupon::updateOrCreate(
                ['code' => $code],
                [
                    'type' => $type,
                    'value' => $value,
                    'min_subtotal' => $min,
                    'max_uses' => $maxUses,
                    'starts_at' => $startsAt,
                    'expires_at' => $expiresAt,
                    'is_active' => $active,
                ]
            );
        }
    }
}
