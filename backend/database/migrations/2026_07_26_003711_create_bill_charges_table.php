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
        Schema::create('bill_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_bill_id')->constrained()->cascadeOnDelete();
            $table->string('charge_type', 20);
            $table->string('charge_name');
            $table->decimal('rate', 8, 4)->nullable();
            $table->decimal('amount', 10, 2);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_charges');
    }
};
