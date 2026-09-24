<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_communication_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->boolean('email_transactional')->default(true);
            $table->boolean('email_marketing')->default(false);
            $table->boolean('sms_transactional')->default(true);
            $table->boolean('sms_marketing')->default(false);
            $table->boolean('push_transactional')->default(true);
            $table->boolean('push_marketing')->default(false);
            $table->boolean('marketing_consent')->default(false);
            $table->timestamp('consent_date')->nullable();
            $table->string('consent_source')->nullable();
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();

            $table->unique('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_communication_preferences');
    }
};
