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

            $table->string('customer_code')->unique();

            $table->string('first_name');
            $table->string('last_name')->nullable();

            $table->string('email')->nullable();
            $table->string('phone')->unique();
            $table->string('whatsapp')->nullable();

            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('district')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('state')->nullable();

            $table->enum('customer_type', [
                'regular',
                'vip',
                'corporate'
            ])->default('regular');

            $table->integer('loyalty_points')->default(0);

            $table->decimal('total_spend', 12, 2)->default(0);

            $table->integer('receipt_count')->default(0);

            $table->timestamp('last_visited_at')->nullable();

            $table->string('id_number')->nullable();

            $table->enum('id_type', [
                'nic',
                'passport'
            ])->nullable();

            $table->enum('status', [
                'active',
                'inactive',
                'suspended'
            ])->default('active');

            $table->boolean('is_active')->default(true);

            $table->softDeletes();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};