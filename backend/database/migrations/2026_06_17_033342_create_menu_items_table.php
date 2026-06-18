<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {

            $table->id();

            $table->foreignId('menu_category_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('slug')->unique();

            $table->string('short_description')->nullable();

            $table->text('long_description')->nullable();

            $table->decimal('base_price', 10, 2);

            $table->string('sku')->unique();

            $table->integer('preparation_time')->default(15);

            $table->string('status')->default('available');

            $table->integer('display_order')->default(0);

            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
