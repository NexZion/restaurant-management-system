<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->unique();
            $table->boolean('is_active')->default(true);
        });
        DB::table('menus')->whereNull('code')->orderBy('id')->get()->each(function ($menu) {
            DB::table('menus')->where('id', $menu->id)->update([
                'code' => 'MENU-' . $menu->id,
                'is_active' => $menu->status === 'active',
            ]);
        });

        Schema::create('branch_menu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['branch_id', 'menu_id']);
        });

        DB::table('menus')->whereNotNull('branch_id')->orderBy('id')->each(function ($menu) {
            DB::table('branch_menu')->insert([
                'branch_id' => $menu->branch_id,
                'menu_id' => $menu->id,
                'created_at' => $menu->created_at,
                'updated_at' => $menu->updated_at,
            ]);
        });

        Schema::table('menus', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
        });

        Schema::table('menu_categories', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->unique();
            $table->string('image_path', 500)->nullable();
            $table->boolean('is_active')->default(true);
        });
        DB::table('menu_categories')->whereNull('code')->orderBy('id')->get()->each(function ($category) {
            DB::table('menu_categories')->where('id', $category->id)->update([
                'code' => 'CAT-' . $category->id,
                'image_path' => $category->image,
                'is_active' => $category->status === 'active',
            ]);
        });

        Schema::create('branch_menu_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_category_id')->constrained('menu_categories')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['branch_id', 'menu_category_id']);
        });

        Schema::table('menu_items', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->decimal('base_cost', 12, 2)->default(0);
            $table->string('image_path', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_available')->default(true);
        });

        Schema::create('branch_menu_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['branch_id', 'menu_item_id']);
        });

        DB::table('menu_items')->where('status', 'unavailable')->update(['is_available' => false]);
        DB::table('menu_items')->where('status', 'out_of_stock')->update(['is_available' => false]);
        DB::table('menu_items')->where('status', 'inactive')->update(['is_active' => false]);
        DB::table('menu_items')->whereNotNull('short_description')->whereNull('description')->update([
            'description' => DB::raw('short_description'),
        ]);
        DB::table('menu_items')->whereNull('description')->update([
            'description' => DB::raw('long_description'),
        ]);

        DB::table('menu_menu_item')
            ->join('branch_menu', 'menu_menu_item.menu_id', '=', 'branch_menu.menu_id')
            ->select('branch_menu.branch_id', 'menu_menu_item.menu_item_id')
            ->distinct()
            ->orderBy('branch_menu.branch_id')
            ->orderBy('menu_menu_item.menu_item_id')
            ->get()
            ->each(function ($assignment) {
                DB::table('branch_menu_item')->insert([
                    'branch_id' => $assignment->branch_id,
                    'menu_item_id' => $assignment->menu_item_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

        DB::table('branch_menu_item')
            ->join('menu_items', 'branch_menu_item.menu_item_id', '=', 'menu_items.id')
            ->select('branch_menu_item.branch_id', 'menu_items.menu_category_id')
            ->distinct()
            ->get()
            ->each(function ($assignment) {
                DB::table('branch_menu_category')->insertOrIgnore([
                    'branch_id' => $assignment->branch_id,
                    'menu_category_id' => $assignment->menu_category_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('symbol', 20)->unique();
            $table->string('unit_type', 30);
            $table->foreignId('base_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->decimal('conversion_factor', 18, 6)->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('raw_materials', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('sku', 80)->unique();
            $table->text('description')->nullable();
            $table->foreignId('base_unit_id')->constrained('units');
            $table->decimal('unit_cost', 14, 4)->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('branch_raw_material', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('raw_material_id')->constrained('raw_materials')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['branch_id', 'raw_material_id']);
        });

        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->unique()->constrained('menu_items')->cascadeOnDelete();
            $table->longText('instructions');
            $table->decimal('yield_quantity', 12, 3)->default(1);
            $table->text('preparation_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('recipe_raw_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->constrained('recipes')->cascadeOnDelete();
            $table->foreignId('raw_material_id')->constrained('raw_materials')->restrictOnDelete();
            $table->decimal('quantity', 12, 4);
            $table->foreignId('unit_id')->constrained('units')->restrictOnDelete();
            $table->integer('display_order')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_raw_materials');
        Schema::dropIfExists('recipes');
        Schema::dropIfExists('branch_raw_material');
        Schema::dropIfExists('raw_materials');
        Schema::dropIfExists('units');
        Schema::dropIfExists('branch_menu_item');
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn(['description', 'base_cost', 'image_path', 'is_active', 'is_available']);
        });
        Schema::dropIfExists('branch_menu_category');
        Schema::table('menu_categories', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn(['code', 'image_path', 'is_active']);
        });
        Schema::table('menus', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->constrained()->cascadeOnDelete();
            $table->dropUnique(['code']);
            $table->dropColumn(['code', 'is_active']);
        });
        DB::table('branch_menu')
            ->select('menu_id', DB::raw('MIN(branch_id) as branch_id'))
            ->groupBy('menu_id')
            ->get()
            ->each(function ($assignment) {
                DB::table('menus')->where('id', $assignment->menu_id)->update([
                    'branch_id' => $assignment->branch_id,
                ]);
            });
        Schema::dropIfExists('branch_menu');
    }
};
