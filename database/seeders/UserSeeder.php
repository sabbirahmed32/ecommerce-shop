<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@nova.com'],
            [
                'name' => 'Nova Admin',
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
                'phone' => '+1 (555) 010-0100',
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@nova.com'],
            [
                'name' => 'Demo User',
                'password' => 'password',
                'role' => User::ROLE_USER,
                'phone' => '+1 (555) 010-0200',
                'address' => '123 Commerce Avenue',
                'city' => 'New York',
                'postal_code' => '10001',
                'country' => 'United States',
            ]
        );
    }
}
