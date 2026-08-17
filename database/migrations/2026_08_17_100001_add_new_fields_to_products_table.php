<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete()->after('category_id');
            $table->text('short_description')->nullable()->after('description');
            $table->decimal('discount_price', 10, 2)->nullable()->after('compare_price');
            $table->string('meta_title')->nullable()->after('rating_count');
            $table->text('meta_description')->nullable()->after('meta_title');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->dropColumn(['brand_id', 'short_description', 'discount_price', 'meta_title', 'meta_description']);
        });
    }
};
