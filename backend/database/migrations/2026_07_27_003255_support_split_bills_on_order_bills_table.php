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
        Schema::table('order_bills', function (Blueprint $table) {
            $table->dropUnique(['order_id']);
            $table->foreignId('parent_bill_id')->nullable()->after('order_id')
                ->constrained('order_bills')->nullOnDelete();
            $table->unsignedInteger('split_number')->nullable()->after('bill_number');
            $table->index(['order_id', 'bill_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_bills', function (Blueprint $table) {
            $table->dropIndex(['order_id', 'bill_status']);
            $table->dropConstrainedForeignId('parent_bill_id');
            $table->dropColumn('split_number');
            $table->unique('order_id');
        });
    }
};
