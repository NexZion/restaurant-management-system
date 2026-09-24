<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_loyalty_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('membership_number')->unique();
            $table->unsignedBigInteger('tier_id')->nullable();
            $table->integer('current_points')->default(0);
            $table->timestamp('joined_at')->nullable();
            $table->string('status', 30)->default('active');
            $table->timestamps();

            $table->unique('customer_id');
            $table->index('tier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_loyalty_profiles');
    }
};
