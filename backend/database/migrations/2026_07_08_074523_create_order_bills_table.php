<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_bills', function (Blueprint $table) {

            $table->id();

            $table->foreignId('order_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('subtotal', 10, 2)
                ->default(0);

            $table->decimal('discount', 10, 2)
                ->default(0);

            $table->decimal('tax', 10, 2)
                ->default(0);

            $table->decimal('service_charge', 10, 2)
                ->default(0);

            $table->decimal('grand_total', 10, 2)
                ->default(0);

            $table->string('bill_status', 20)
                ->default('unpaid');

            $table->timestamps();

            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_bills');
    }
};