<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('preferred_branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('preferred_order_type', 30)->nullable();
            $table->string('preferred_language', 20)->nullable();
            $table->string('spice_preference', 30)->nullable();
            $table->string('dietary_preference')->nullable();
            $table->string('favorite_cuisine')->nullable();
            $table->timestamps();

            $table->unique('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_preferences');
    }
};
