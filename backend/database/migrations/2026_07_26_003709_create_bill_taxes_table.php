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
        Schema::create('bill_taxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_bill_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('tax_id')->nullable()->index();
            $table->string('tax_name');
            $table->decimal('tax_rate', 8, 4);
            $table->decimal('taxable_amount', 10, 2);
            $table->decimal('tax_amount', 10, 2);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_taxes');
    }
};
