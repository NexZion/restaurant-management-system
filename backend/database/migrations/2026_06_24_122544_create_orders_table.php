<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {

            $table->id();

            $table->foreignId('branch_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('order_number', 50)->unique();

            $table->foreignId('customer_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('table_id')
                ->nullable()
                ->constrained('restaurant_tables')
                ->nullOnDelete();

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('assigned_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('order_type', 30);
            $table->string('status', 30);
            $table->string('payment_status', 30);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_total', 12, 2);
            $table->decimal('tax_total', 12, 2);
            $table->decimal('service_charge_total', 12, 2);
            $table->decimal('grand_total', 12, 2);
            $table->decimal('paid_total', 12, 2);
            $table->decimal('balance_due', 12, 2);
            $table->text('customer_note')->nullable();
            $table->text('internal_note')->nullable();
            $table->dateTime('ordered_at');
            $table->dateTime('confirmed_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};