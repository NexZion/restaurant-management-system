<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {

            $table->id();

            $table->foreignId('order_bill_id')
                ->unique()
                ->constrained('order_bills')
                ->cascadeOnDelete();

            $table->string('payment_method', 20);

            $table->decimal('amount_paid', 10, 2);

            $table->decimal('amount_received', 10, 2);

            $table->decimal('balance_amount', 10, 2)
                ->default(0);

            $table->string('payment_status', 20)
                ->default('pending');

            $table->string('transaction_reference')
                ->nullable();

            $table->text('notes')
                ->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};