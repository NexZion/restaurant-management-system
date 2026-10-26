<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('variants', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->enum('selection_type', ['single', 'multiple'])->default('single');
            $table->unsignedInteger('min_select')->default(1);
            $table->unsignedInteger('max_select')->default(1);
            $table->boolean('is_active')->default(true);
        });

        Schema::create('variant_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('variants')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('code', 50);
            $table->decimal('default_additional_price', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->unique(['variant_id', 'code']);
        });

        Schema::create('menu_item_variant_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            $table->foreignId('variant_option_id')->constrained('variant_options')->cascadeOnDelete();
            $table->decimal('additional_price', 12, 2)->default(0);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->unique(['menu_item_id', 'variant_option_id']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->json('variant_options')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('variant_options');
        });
        Schema::dropIfExists('menu_item_variant_options');
        Schema::dropIfExists('variant_options');
        Schema::dropIfExists('variants');
    }
};
