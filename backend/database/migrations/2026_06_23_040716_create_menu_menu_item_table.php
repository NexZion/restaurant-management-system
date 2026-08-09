<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_menu_item', function (Blueprint $table) {

            $table->id();

            $table->foreignId('menu_id')
                ->constrained('menus')
                ->cascadeOnDelete();

            $table->foreignId('menu_item_id')
                ->constrained('menu_items')
                ->cascadeOnDelete();

            $table->integer('display_order')
                ->default(0);

            $table->timestamps();

            $table->unique([
                'menu_id',
                'menu_item_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_menu_item');
    }
};
