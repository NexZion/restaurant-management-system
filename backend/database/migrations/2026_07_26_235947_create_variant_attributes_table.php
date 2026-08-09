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
        if (! Schema::hasTable('variant_attributes')) {
            Schema::create('variant_attributes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('menu_item_variant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
                $table->foreignId('attribute_value_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
            });
        }

        if (
            ! Schema::hasIndex('variant_attributes', 'variant_attributes_menu_item_variant_id_attribute_id_unique')
            && ! Schema::hasIndex('variant_attributes', 'variant_attr_variant_attribute_unique')
        ) {
            Schema::table('variant_attributes', function (Blueprint $table) {
                $table->unique(
                    ['menu_item_variant_id', 'attribute_id'],
                    'variant_attr_variant_attribute_unique',
                );
            });
        }
        if (! Schema::hasIndex('variant_attributes', 'variant_attr_variant_value_unique')) {
            Schema::table('variant_attributes', function (Blueprint $table) {
                $table->unique(
                    ['menu_item_variant_id', 'attribute_value_id'],
                    'variant_attr_variant_value_unique',
                );
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variant_attributes');
    }
};
