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
        Schema::create('branches', function (Blueprint $table) {

            // Identification
            $table->id();
            $table->string('code');
            $table->string('name');
            $table->string('slug');

            // Location Details
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('city');
            $table->string('state_province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Sri Lanka');

            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Contact Info
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('whatsapp')->nullable();

            // Business Configuration
            $table->enum('branch_type', [
                'restaurant',
                'hotel',
                'cafe',
                'resort'
            ])->default('restaurant');

            $table->boolean('has_dining')->default(true);
            $table->boolean('has_rooms')->default(false);
            $table->boolean('has_delivery')->default(false);

            // Operational Settings
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();
            $table->string('timezone')->default('Asia/Colombo');

            // Management
            $table->string('manager_name')->nullable();
            $table->string('contact_person_phone')->nullable();

            // System Fields
            $table->string('status')->default('active');
            $table->boolean('is_active')->default(true);

            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
