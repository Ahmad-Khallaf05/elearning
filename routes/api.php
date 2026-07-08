<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\IsAdmin;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('courses', CourseController::class);
    
    // Nested Section & Lesson Routes
    Route::apiResource('courses.sections', SectionController::class)->shallow();
    Route::apiResource('sections.lessons', LessonController::class)->shallow();

    // Checkout
    Route::post('/checkout', [CheckoutController::class, 'checkout']);

    // Student specific routes
    Route::get('/student/enrollments', [StudentController::class, 'enrollments']);
    Route::post('/student/lessons/{lesson}/complete', [StudentController::class, 'toggleLessonComplete']);

    // Admin Routes
    Route::middleware([IsAdmin::class])->prefix('admin')->group(function () {
        Route::get('/courses', [AdminController::class, 'pendingCourses']);
        Route::patch('/courses/{course}/status', [AdminController::class, 'updateCourseStatus']);
    });
});
