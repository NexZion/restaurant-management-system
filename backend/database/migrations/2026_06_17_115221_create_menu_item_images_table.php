<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_item_images', function (Blueprint $table) {

            $table->id();

            $table->foreignId('menu_item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('image_path');

            $table->boolean('is_primary')
                ->default(false);

            $table->integer('display_order')
                ->default(0);

            $table->softDeletes();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_item_images');
    }
};
