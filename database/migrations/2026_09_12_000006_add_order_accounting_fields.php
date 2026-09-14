<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending')->after('payment_status');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('total_amount');
            $table->decimal('platform_fee_rate', 5, 4)->default(0.20)->after('discount_amount');
            $table->decimal('platform_fee_amount', 10, 2)->default(0)->after('platform_fee_rate');
            $table->string('currency', 3)->default('USD')->after('platform_fee_amount');
            $table->string('webhook_event_id')->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('orders', fn (Blueprint $table) => $table->dropColumn(['status', 'discount_amount', 'platform_fee_rate', 'platform_fee_amount', 'currency', 'webhook_event_id']));
    }
};
