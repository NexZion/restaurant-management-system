<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::dropIfExists('branch_menu_categories');
    }

    public function down(): void
    {
        if (Schema::hasTable('branch_menu_categories')) {
            return;
        }

        Schema::create('branch_menu_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_category_id')->constrained('menu_categories')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->unique(['branch_id', 'menu_category_id']);
        });

        $branches = DB::table('branches')->pluck('id');
        DB::table('menu_categories')->get()->each(function ($category) use ($branches) {
            foreach ($branches as $branchId) {
                DB::table('branch_menu_categories')->insertOrIgnore([
                    'branch_id' => $branchId,
                    'menu_category_id' => $category->id,
                    'is_active' => $category->is_active,
                    'display_order' => $category->display_order,
                ]);
            }
        });
    }
};
