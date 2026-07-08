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

            $table->string('order_number')->unique();

            $table->foreignId('table_id')
                ->nullable()
                ->constrained('restaurant_tables')
                ->nullOnDelete();

            $table->foreignId('customer_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('waiter_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->enum('order_type', [
                'dining',
                'takeaway',
                'delivery'
            ]);

            $table->string('status')->default('pending');

            $table->boolean('is_online')
                ->default(false);

            $table->text('notes')
                ->nullable();

            $table->timestamps();

            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};