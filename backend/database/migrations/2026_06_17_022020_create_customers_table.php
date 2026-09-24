<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {

            $table->id();

            $table->uuid('uuid')->unique();
            $table->string('customer_number');
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('display_name')->nullable();
            $table->string('phone')->unique();
            $table->string('secondary_phone')->nullable();
            $table->string('email')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('customer_type', 50)->default('regular');
            $table->string('status')->default('active');
            $table->foreignId('preferred_branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('profile_photo')->nullable();
            $table->text('notes')->nullable();

            $table->softDeletes();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
