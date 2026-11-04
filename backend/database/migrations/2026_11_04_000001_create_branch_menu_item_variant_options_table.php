<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('branch_menu_item_variant_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('variant_option_id')->constrained('variant_options')->cascadeOnDelete();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
            $table->unique(['branch_id', 'menu_item_id', 'variant_option_id'], 'branch_item_variant_option_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_menu_item_variant_options');
    }
};
