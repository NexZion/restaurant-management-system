<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function renameTableIfNeeded(string $from, string $to): void
    {
        if (Schema::hasTable($from) && !Schema::hasTable($to)) {
            Schema::rename($from, $to);
        }
    }

    public function up(): void
    {
        $this->renameTableIfNeeded('branch_menu', 'branch_menus');
        $this->renameTableIfNeeded('branch_menu_category', 'branch_menu_categories');
        $this->renameTableIfNeeded('branch_menu_item', 'branch_menu_items');
        $this->renameTableIfNeeded('branch_raw_material', 'branch_raw_materials');
        $this->renameTableIfNeeded('menu_menu_item', 'menu_menu_items');

        DB::table('menus')->whereNull('code')->orderBy('id')->get()->each(function ($menu) {
            DB::table('menus')->where('id', $menu->id)->update([
                'code' => 'MENU-' . $menu->id,
                'is_active' => $menu->status === 'active',
            ]);
        });
        DB::table('menu_categories')->whereNull('code')->orderBy('id')->get()->each(function ($category) {
            DB::table('menu_categories')->where('id', $category->id)->update([
                'code' => 'CAT-' . $category->id,
                'image_path' => $category->image,
                'is_active' => $category->status === 'active',
            ]);
        });
        DB::table('menu_items')->whereNull('description')->update([
            'description' => DB::raw('COALESCE(short_description, long_description)'),
        ]);
        DB::table('menu_items')->whereIn('status', ['unavailable', 'out_of_stock'])
            ->update(['is_available' => false]);
        DB::table('menu_items')->where('status', 'inactive')->update(['is_active' => false]);

        if (Schema::hasColumn('menus', 'name')) {
            Schema::table('menus', function (Blueprint $table) {
                $table->string('name', 150)->change();
                $table->string('code', 50)->nullable(false)->change();
                $table->unsignedInteger('display_order')->default(0)->change();
            });
        }
        if (Schema::hasColumn('menu_categories', 'name')) {
            Schema::table('menu_categories', function (Blueprint $table) {
                $table->string('name', 150)->change();
                $table->string('code', 50)->nullable(false)->change();
                $table->string('image_path', 500)->nullable()->change();
                $table->unsignedInteger('display_order')->default(0)->change();
            });
        }
        Schema::table('menu_items', function (Blueprint $table) {
            $table->string('name', 200)->change();
            $table->string('sku', 80)->change();
            $table->text('description')->nullable()->change();
            $table->decimal('base_price', 12, 2)->default(0)->change();
            $table->decimal('base_cost', 12, 2)->default(0)->change();
            $table->unsignedSmallInteger('preparation_time')->nullable()->change();
            $table->unsignedInteger('display_order')->default(0)->change();
        });

        Schema::table('branch_menus', function (Blueprint $table) {
            if (!Schema::hasColumn('branch_menus', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
            if (!Schema::hasColumn('branch_menus', 'display_order')) {
                $table->unsignedInteger('display_order')->default(0);
            }
        });
        Schema::table('branch_menu_categories', function (Blueprint $table) {
            if (!Schema::hasColumn('branch_menu_categories', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
            if (!Schema::hasColumn('branch_menu_categories', 'display_order')) {
                $table->unsignedInteger('display_order')->default(0);
            }
        });
        DB::table('branch_menus')->join('menus', 'branch_menus.menu_id', '=', 'menus.id')
            ->update(['branch_menus.display_order' => DB::raw('menus.display_order')]);
        DB::table('branch_menu_categories')
            ->join('menu_categories', 'branch_menu_categories.menu_category_id', '=', 'menu_categories.id')
            ->update(['branch_menu_categories.display_order' => DB::raw('menu_categories.display_order')]);
        Schema::table('branch_menu_items', function (Blueprint $table) {
            if (!Schema::hasColumn('branch_menu_items', 'selling_price')) {
                $table->decimal('selling_price', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('branch_menu_items', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
            if (!Schema::hasColumn('branch_menu_items', 'is_available')) {
                $table->boolean('is_available')->default(true);
            }
            if (!Schema::hasColumn('branch_menu_items', 'display_order')) {
                $table->unsignedInteger('display_order')->default(0);
            }
        });
        Schema::table('branch_menu_items', function (Blueprint $table) {
            $table->decimal('selling_price', 12, 2)->nullable()->change();
            $table->unsignedInteger('display_order')->default(0)->change();
        });
        Schema::table('branch_menus', function (Blueprint $table) {
            $table->unsignedInteger('display_order')->default(0)->change();
        });
        Schema::table('branch_menu_categories', function (Blueprint $table) {
            $table->unsignedInteger('display_order')->default(0)->change();
            $table->dropTimestamps();
        });

        if (Schema::hasColumn('raw_materials', 'unit_cost')) {
            Schema::table('raw_materials', function (Blueprint $table) {
                $table->renameColumn('unit_cost', 'default_unit_cost');
            });
        }
        Schema::table('raw_materials', function (Blueprint $table) {
            $table->string('sku', 80)->change();
            $table->string('name', 200)->change();
            $table->decimal('default_unit_cost', 14, 4)->default(0)->change();
        });
        Schema::table('branch_raw_materials', function (Blueprint $table) {
            if (!Schema::hasColumn('branch_raw_materials', 'unit_cost')) {
                $table->decimal('unit_cost', 14, 4)->nullable();
            }
            if (!Schema::hasColumn('branch_raw_materials', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });
        Schema::table('branch_raw_materials', function (Blueprint $table) {
            $table->decimal('unit_cost', 14, 4)->nullable()->change();
        });

        Schema::table('recipe_raw_materials', function (Blueprint $table) {
            $table->unsignedInteger('display_order')->default(0)->change();
            $table->unique(['recipe_id', 'raw_material_id']);
        });

        if (Schema::hasTable('menu_item_images')) {
            Schema::table('menu_item_images', function (Blueprint $table) {
                $table->string('image_path', 500)->change();
                $table->string('alt_text', 255)->nullable();
                $table->unsignedInteger('display_order')->default(0)->change();
                $table->dropSoftDeletes();
                $table->dropColumn('updated_at');
            });
        }
        Schema::table('menu_menu_items', function (Blueprint $table) {
            $table->dropTimestamps();
        });
        Schema::table('recipe_raw_materials', function (Blueprint $table) {
            $table->dropTimestamps();
        });
        Schema::table('units', function (Blueprint $table) {
            $table->dropTimestamps();
        });

        DB::table('menu_items')->whereNotNull('image_path')->orderBy('id')->get()->each(function ($item) {
            $hasPrimaryImage = DB::table('menu_item_images')
                ->where('menu_item_id', $item->id)
                ->where('is_primary', true)
                ->exists();
            if (!$hasPrimaryImage) {
                DB::table('menu_item_images')->insert([
                    'menu_item_id' => $item->id,
                    'image_path' => $item->image_path,
                    'alt_text' => $item->name,
                    'is_primary' => true,
                    'display_order' => 0,
                    'created_at' => now(),
                ]);
            }
        });
        DB::table('branch_menu_items')
            ->join('menu_menu_items', 'branch_menu_items.menu_item_id', '=', 'menu_menu_items.menu_item_id')
            ->join('branch_menus', function ($join) {
                $join->on('branch_menus.menu_id', '=', 'menu_menu_items.menu_id')
                    ->on('branch_menus.branch_id', '=', 'branch_menu_items.branch_id');
            })
            ->update(['branch_menu_items.display_order' => DB::raw('menu_menu_items.display_order')]);

        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        Schema::table('menu_categories', function (Blueprint $table) {
            $table->dropColumn(['image', 'status']);
        });
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn(['slug', 'short_description', 'long_description', 'status', 'image_path']);
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->string('status', 20)->default('active');
        });
        DB::table('menus')->where('is_active', false)->update(['status' => 'inactive']);

        Schema::table('menu_categories', function (Blueprint $table) {
            $table->string('image')->nullable();
            $table->string('status')->default('active');
        });
        DB::table('menu_categories')->whereNotNull('image_path')->update(['image' => DB::raw('image_path')]);
        DB::table('menu_categories')->where('is_active', false)->update(['status' => 'inactive']);

        Schema::table('menu_items', function (Blueprint $table) {
            $table->string('slug')->nullable();
            $table->string('short_description')->nullable();
            $table->longText('long_description')->nullable();
            $table->string('status')->default('available');
            $table->string('image_path', 500)->nullable();
        });
        DB::table('menu_items')->whereNull('slug')->update(['slug' => DB::raw('sku')]);
        DB::table('menu_items')->where('is_available', false)->update(['status' => 'unavailable']);

        Schema::table('raw_materials', function (Blueprint $table) {
            $table->decimal('unit_cost', 14, 4)->default(0);
        });
        DB::table('raw_materials')->update(['unit_cost' => DB::raw('default_unit_cost')]);
        Schema::table('branch_raw_materials', function (Blueprint $table) {
            $table->dropColumn(['unit_cost', 'is_active']);
        });
        Schema::table('recipe_raw_materials', function (Blueprint $table) {
            $table->dropUnique(['recipe_id', 'raw_material_id']);
            $table->timestamps();
        });
        Schema::table('menu_menu_items', function (Blueprint $table) {
            $table->timestamps();
        });
        Schema::table('branch_menu_categories', function (Blueprint $table) {
            $table->timestamps();
        });
        Schema::table('units', function (Blueprint $table) {
            $table->timestamps();
        });
        Schema::table('menu_item_images', function (Blueprint $table) {
            $table->timestamp('updated_at')->nullable();
            $table->softDeletes();
            $table->dropColumn('alt_text');
        });

        Schema::rename('branch_raw_materials', 'branch_raw_material');
        Schema::rename('menu_menu_items', 'menu_menu_item');
        Schema::rename('branch_menu_items', 'branch_menu_item');
        Schema::rename('branch_menu_categories', 'branch_menu_category');
        Schema::rename('branch_menus', 'branch_menu');
    }
};
