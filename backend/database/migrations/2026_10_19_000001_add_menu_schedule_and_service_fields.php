<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->string('menu_type', 30)->default('regular')->after('code');
            $table->string('availability_type', 30)->default('all_day')->after('menu_type');
            $table->time('start_time')->nullable()->after('availability_type');
            $table->time('end_time')->nullable()->after('start_time');
            $table->json('available_days')->nullable()->after('end_time');
            $table->date('start_date')->nullable()->after('available_days');
            $table->date('end_date')->nullable()->after('start_date');
            $table->json('service_types')->nullable()->after('end_date');
        });

        DB::table('menus')->whereNull('service_types')->update([
            'service_types' => json_encode(['dine_in', 'takeaway', 'delivery']),
        ]);

        Schema::table('menus', function (Blueprint $table) {
            $table->json('service_types')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn([
                'menu_type',
                'availability_type',
                'start_time',
                'end_time',
                'available_days',
                'start_date',
                'end_date',
                'service_types',
            ]);
        });
    }
};
