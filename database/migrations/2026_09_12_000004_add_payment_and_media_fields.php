<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('student_id')->constrained()->cascadeOnDelete();
            $table->string('payment_provider')->nullable();
            $table->string('provider_reference')->nullable()->unique();
            $table->boolean('webhook_verified')->default(false);
            $table->json('metadata')->nullable();
        });
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('hls_path')->nullable();
            $table->string('hls_key_path')->nullable();
            $table->enum('processing_status', ['pending', 'processing', 'ready', 'failed'])->default('pending');
        });
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('number')->unique();
            $table->enum('locale', ['ar', 'en'])->default('ar');
            $table->string('file_path')->nullable();
            $table->timestamps();
        });
        Schema::create('instructor_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete()->unique();
            $table->decimal('balance', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_wallets');
        Schema::dropIfExists('invoices');
        Schema::table('lessons', fn (Blueprint $table) => $table->dropColumn(['hls_path', 'hls_key_path', 'processing_status']));
        Schema::table('orders', fn (Blueprint $table) => $table->dropColumn(['course_id', 'payment_provider', 'provider_reference', 'webhook_verified', 'metadata']));
    }
};
