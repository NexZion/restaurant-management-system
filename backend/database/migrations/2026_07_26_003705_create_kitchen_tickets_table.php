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
        Schema::create('kitchen_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('ticket_number');
            $table->foreignId('kitchen_station_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('pending');
            $table->string('priority', 20)->default('normal');
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('generated_at');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('ready_at')->nullable();
            $table->dateTime('closed_at')->nullable();
            $table->unsignedInteger('reprint_count')->default(0);
            $table->dateTime('last_printed_at')->nullable();
            $table->timestamps();

            $table->unique(['branch_id', 'ticket_number']);
            $table->index(['kitchen_station_id', 'status', 'generated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kitchen_tickets');
    }
};
