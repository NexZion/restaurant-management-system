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
        Schema::table('restaurant_tables', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('section_id')->nullable()->after('section')->index();
            $table->unsignedBigInteger('floor_id')->nullable()->after('section_id')->index();

            $table->index(['branch_id', 'status']);
            $table->unique(['branch_id', 'table_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurant_tables', function (Blueprint $table) {
            $table->dropIndex(['branch_id', 'status']);
            $table->dropUnique(['branch_id', 'table_number']);
            $table->dropIndex(['section_id']);
            $table->dropIndex(['floor_id']);
            $table->dropConstrainedForeignId('branch_id');
            $table->dropColumn(['section_id', 'floor_id']);
        });
    }
};
