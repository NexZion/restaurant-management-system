<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('branch_menu_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            $table->unsignedInteger('display_order')->default(0);
            $table->unique(['menu_id', 'branch_id', 'menu_item_id'], 'branch_menu_menu_items_unique');
            $table->index(['branch_id', 'menu_item_id'], 'branch_menu_menu_items_branch_item_index');
        });

        if (Schema::hasTable('menu_menu_items') && Schema::hasTable('branch_menus')) {
            DB::table('menu_menu_items')
                ->join('branch_menus', 'branch_menus.menu_id', '=', 'menu_menu_items.menu_id')
                ->join('branch_menu_items', function ($join) {
                    $join->on('branch_menu_items.branch_id', '=', 'branch_menus.branch_id')
                        ->on('branch_menu_items.menu_item_id', '=', 'menu_menu_items.menu_item_id');
                })
                ->where('branch_menu_items.is_active', true)
                ->where('branch_menu_items.is_available', true)
                ->select('branch_menus.branch_id', 'menu_menu_items.menu_id', 'menu_menu_items.menu_item_id', 'menu_menu_items.display_order')
                ->orderBy('branch_menus.branch_id')
                ->orderBy('menu_menu_items.menu_id')
                ->orderBy('menu_menu_items.menu_item_id')
                ->get()
                ->each(function ($assignment) {
                    DB::table('branch_menu_menu_items')->insertOrIgnore([
                        'branch_id' => $assignment->branch_id,
                        'menu_id' => $assignment->menu_id,
                        'menu_item_id' => $assignment->menu_item_id,
                        'display_order' => $assignment->display_order,
                    ]);
                });
        }

        Schema::dropIfExists('menu_menu_items');
    }

    public function down(): void
    {
        Schema::create('menu_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            $table->unsignedInteger('display_order')->default(0);
            $table->unique(['menu_id', 'menu_item_id']);
        });

        DB::table('branch_menu_menu_items')
            ->select('menu_id', 'menu_item_id', DB::raw('MIN(display_order) as display_order'))
            ->groupBy('menu_id', 'menu_item_id')
            ->get()
            ->each(function ($assignment) {
                DB::table('menu_menu_items')->insert([
                    'menu_id' => $assignment->menu_id,
                    'menu_item_id' => $assignment->menu_item_id,
                    'display_order' => $assignment->display_order,
                ]);
            });

        Schema::dropIfExists('branch_menu_menu_items');
    }
};
