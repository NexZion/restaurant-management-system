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
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique('orders_order_number_unique');
            $table->foreignId('table_session_id')->nullable()->after('table_id')->constrained()->nullOnDelete();
            $table->foreignId('reservation_id')->nullable()->after('table_session_id')->constrained()->nullOnDelete();
            $table->foreignId('cashier_id')->nullable()->after('waiter_id')->constrained('users')->nullOnDelete();
            $table->string('order_source', 30)->default('pos')->after('order_type');
            $table->string('payment_status', 30)->default('unpaid')->after('status');
            $table->unsignedInteger('guest_count')->nullable()->after('is_online');
            $table->string('priority', 20)->default('normal')->after('guest_count');
            $table->dateTime('requested_fulfillment_at')->nullable();
            $table->dateTime('accepted_at')->nullable();
            $table->dateTime('preparing_at')->nullable();
            $table->dateTime('ready_at')->nullable();
            $table->dateTime('served_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->unique(['branch_id', 'order_number']);
            $table->index(['branch_id', 'status', 'created_at']);
            $table->index('customer_id');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('parent_order_item_id')->nullable()->after('order_id')->constrained('order_items')->nullOnDelete();
            $table->unsignedBigInteger('menu_item_variant_id')->nullable()->after('menu_item_id')->index();
            $table->string('menu_item_name_snapshot')->nullable()->after('menu_item_variant_id');
            $table->string('variant_name_snapshot')->nullable()->after('menu_item_name_snapshot');
            $table->string('sku_snapshot')->nullable()->after('variant_name_snapshot');
            $table->decimal('unit_cost', 10, 2)->nullable()->after('unit_price');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('discount');
            $table->decimal('tax_rate', 8, 4)->nullable()->after('discount_amount');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('tax_rate');
            $table->decimal('service_charge_amount', 10, 2)->default(0)->after('tax_amount');
            $table->unsignedInteger('served_quantity')->default(0)->after('status');
            $table->unsignedInteger('cancelled_quantity')->default(0)->after('served_quantity');
            $table->string('priority', 20)->default('normal')->after('cancelled_quantity');
            $table->foreignId('kitchen_station_id')->nullable()->after('priority')->constrained()->nullOnDelete();
            $table->text('rejection_reason')->nullable()->after('notes');
            $table->foreignId('created_by')->nullable()->after('rejection_reason')->constrained('users')->nullOnDelete();
            $table->foreignId('cancelled_by')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            $table->dateTime('prepared_at')->nullable();
            $table->dateTime('ready_at')->nullable();
            $table->dateTime('served_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();
        });

        Schema::table('order_bills', function (Blueprint $table) {
            $table->string('bill_number')->nullable()->after('order_id');
            $table->decimal('rounding_amount', 10, 2)->default(0)->after('service_charge');
            $table->decimal('paid_amount', 10, 2)->default(0)->after('grand_total');
            $table->decimal('balance_due', 10, 2)->default(0)->after('paid_amount');
            $table->foreignId('generated_by')->nullable()->after('bill_status')->constrained('users')->nullOnDelete();
            $table->dateTime('generated_at')->nullable()->after('generated_by');
            $table->foreignId('voided_by')->nullable()->after('generated_at')->constrained('users')->nullOnDelete();
            $table->dateTime('voided_at')->nullable()->after('voided_by');
            $table->text('void_reason')->nullable()->after('voided_at');

            $table->unique('order_id');
            $table->unique('bill_number');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique('payments_order_bill_id_unique');
            $table->foreignId('payment_method_id')->nullable()->after('order_bill_id')->constrained()->nullOnDelete();
            $table->string('payment_number')->nullable()->after('payment_method_id');
            $table->decimal('change_amount', 10, 2)->default(0)->after('amount_received');
            $table->string('gateway_transaction_id')->nullable()->after('transaction_reference');
            $table->json('gateway_response')->nullable()->after('gateway_transaction_id');
            $table->string('card_last_four', 4)->nullable()->after('gateway_response');
            $table->dateTime('paid_at')->nullable()->after('card_last_four');
            $table->foreignId('voided_by')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            $table->dateTime('voided_at')->nullable()->after('voided_by');
            $table->text('void_reason')->nullable()->after('voided_at');

            $table->index('order_bill_id');
            $table->unique('payment_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['payment_number']);
            $table->dropIndex(['order_bill_id']);
            $table->dropConstrainedForeignId('payment_method_id');
            $table->dropConstrainedForeignId('voided_by');
            $table->dropColumn([
                'payment_number', 'change_amount', 'gateway_transaction_id',
                'gateway_response', 'card_last_four', 'paid_at', 'voided_at', 'void_reason',
            ]);
            $table->unique('order_bill_id');
        });

        Schema::table('order_bills', function (Blueprint $table) {
            $table->dropUnique(['order_id']);
            $table->dropUnique(['bill_number']);
            $table->dropConstrainedForeignId('generated_by');
            $table->dropConstrainedForeignId('voided_by');
            $table->dropColumn([
                'bill_number', 'rounding_amount', 'paid_amount', 'balance_due',
                'generated_at', 'voided_at', 'void_reason',
            ]);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_order_item_id');
            $table->dropConstrainedForeignId('kitchen_station_id');
            $table->dropConstrainedForeignId('created_by');
            $table->dropConstrainedForeignId('cancelled_by');
            $table->dropColumn([
                'menu_item_variant_id', 'menu_item_name_snapshot', 'variant_name_snapshot',
                'sku_snapshot', 'unit_cost', 'discount_amount', 'tax_rate', 'tax_amount',
                'service_charge_amount', 'served_quantity', 'cancelled_quantity', 'priority',
                'rejection_reason', 'prepared_at', 'ready_at', 'served_at', 'cancelled_at',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['branch_id', 'order_number']);
            $table->dropIndex(['branch_id', 'status', 'created_at']);
            $table->dropIndex(['customer_id']);
            $table->dropConstrainedForeignId('table_session_id');
            $table->dropConstrainedForeignId('reservation_id');
            $table->dropConstrainedForeignId('cashier_id');
            $table->dropColumn([
                'order_source', 'payment_status', 'guest_count', 'priority',
                'requested_fulfillment_at', 'accepted_at', 'preparing_at', 'ready_at',
                'served_at', 'completed_at', 'cancelled_at', 'cancellation_reason',
            ]);
            $table->unique('order_number');
        });
    }
};
