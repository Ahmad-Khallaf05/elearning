<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            if (!Schema::hasColumn('lessons', 'source_type')) {
                $table->string('source_type')->nullable()->default('url')->after('type');
            }

            if (!Schema::hasColumn('lessons', 'website_url')) {
                $table->string('website_url')->nullable()->after('vod_url');
            }

            if (!Schema::hasColumn('lessons', 'file_path')) {
                $table->string('file_path')->nullable()->after('website_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            if (Schema::hasColumn('lessons', 'file_path')) {
                $table->dropColumn('file_path');
            }

            if (Schema::hasColumn('lessons', 'website_url')) {
                $table->dropColumn('website_url');
            }

            if (Schema::hasColumn('lessons', 'source_type')) {
                $table->dropColumn('source_type');
            }
        });
    }
};
