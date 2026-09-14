<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->json('title_translations')->nullable();
            $table->json('description_translations')->nullable();
        });
        Schema::table('sections', function (Blueprint $table) {
            $table->json('title_translations')->nullable();
        });
        Schema::table('lessons', function (Blueprint $table) {
            $table->json('title_translations')->nullable();
            $table->json('description_translations')->nullable();
        });
        Schema::table('quizzes', function (Blueprint $table) {
            $table->json('title_translations')->nullable();
            $table->json('description_translations')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('courses', fn (Blueprint $table) => $table->dropColumn(['title_translations', 'description_translations']));
        Schema::table('sections', fn (Blueprint $table) => $table->dropColumn('title_translations'));
        Schema::table('lessons', fn (Blueprint $table) => $table->dropColumn(['title_translations', 'description_translations']));
        Schema::table('quizzes', fn (Blueprint $table) => $table->dropColumn(['title_translations', 'description_translations']));
    }
};
