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
        // Keep a non-unique index available for the order_id foreign key
        // before removing the original unique index (required by MySQL).
        if (! Schema::hasIndex('order_bills', 'order_bills_order_id_index')) {
            Schema::table('order_bills', function (Blueprint $table) {
                $table->index('order_id', 'order_bills_order_id_index');
            });
        }
        if (Schema::hasIndex('order_bills', 'order_bills_order_id_unique')) {
            Schema::table('order_bills', function (Blueprint $table) {
                $table->dropUnique('order_bills_order_id_unique');
            });
        }
        if (! Schema::hasColumn('order_bills', 'parent_bill_id')) {
            Schema::table('order_bills', function (Blueprint $table) {
                $table->foreignId('parent_bill_id')->nullable()->after('order_id')
                    ->constrained('order_bills')->nullOnDelete();
                $table->unsignedInteger('split_number')->nullable()->after('bill_number');
            });
        }
        if (! Schema::hasIndex('order_bills', 'order_bills_order_id_bill_status_index')) {
            Schema::table('order_bills', function (Blueprint $table) {
                $table->index(['order_id', 'bill_status']);
            });
        }
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
