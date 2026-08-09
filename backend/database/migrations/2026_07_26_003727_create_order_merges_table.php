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
        Schema::create('order_merges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_order_id')->constrained('orders')->restrictOnDelete();
            $table->foreignId('target_order_id')->constrained('orders')->restrictOnDelete();
            $table->foreignId('merged_by')->constrained('users')->restrictOnDelete();
            $table->dateTime('merged_at');

            $table->index(['source_order_id', 'target_order_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_merges');
    }
};
