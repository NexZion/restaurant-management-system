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
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('guest_name')->nullable();
            $table->string('guest_phone', 30)->nullable();
            $table->string('guest_email')->nullable();
            $table->string('source', 30)->default('walk_in');
            $table->dateTime('confirmed_at')->nullable();
            $table->dateTime('seated_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('pos_terminal_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cashier_shift_id')->nullable()->constrained()->nullOnDelete();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('menu_item_variant_id')->references('id')->on('menu_item_variants')->nullOnDelete();
        });
        Schema::table('order_item_modifiers', function (Blueprint $table) {
            $table->foreign('modifier_group_id')->references('id')->on('modifier_groups')->nullOnDelete();
            $table->foreign('modifier_option_id')->references('id')->on('modifier_options')->nullOnDelete();
        });
        Schema::table('restaurant_tables', function (Blueprint $table) {
            $table->foreign('section_id')->references('id')->on('restaurant_sections')->nullOnDelete();
            $table->foreign('floor_id')->references('id')->on('restaurant_floors')->nullOnDelete();
        });
        Schema::table('bill_taxes', function (Blueprint $table) {
            $table->foreign('tax_id')->references('id')->on('taxes')->nullOnDelete();
        });
        Schema::table('order_deliveries', function (Blueprint $table) {
            $table->foreign('delivery_address_id')->references('id')->on('customer_addresses')->nullOnDelete();
        });
        Schema::table('kitchen_stations', function (Blueprint $table) {
            $table->foreign('printer_id')->references('id')->on('printers')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kitchen_stations', fn (Blueprint $table) => $table->dropForeign(['printer_id']));
        Schema::table('order_deliveries', fn (Blueprint $table) => $table->dropForeign(['delivery_address_id']));
        Schema::table('bill_taxes', fn (Blueprint $table) => $table->dropForeign(['tax_id']));
        Schema::table('restaurant_tables', function (Blueprint $table) {
            $table->dropForeign(['section_id']);
            $table->dropForeign(['floor_id']);
        });
        Schema::table('order_item_modifiers', function (Blueprint $table) {
            $table->dropForeign(['modifier_group_id']);
            $table->dropForeign(['modifier_option_id']);
        });
        Schema::table('order_items', fn (Blueprint $table) => $table->dropForeign(['menu_item_variant_id']));
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pos_terminal_id');
            $table->dropConstrainedForeignId('cashier_shift_id');
        });
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'guest_name', 'guest_phone', 'guest_email', 'source', 'confirmed_at',
                'seated_at', 'completed_at', 'cancelled_at', 'cancellation_reason',
            ]);
        });
    }
};
