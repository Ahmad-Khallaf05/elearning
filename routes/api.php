<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\IsAdmin;
use App\Http\Controllers\ParentLinkController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\VideoUploadController;
use App\Http\Controllers\HlsController;
use App\Http\Controllers\PrivateFileController;
use App\Http\Controllers\PayoutController;
use App\Http\Controllers\InstructorPayoutController;
use App\Http\Controllers\AdminPayoutController;
use App\Http\Controllers\ParentDashboardController;
use App\Http\Controllers\PayPalController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/v1/payments/paypal/capture', [PayPalController::class, 'capture'])
    ->name('paypal.capture');
Route::post('/v1/payments/paypal/webhook', [PayPalController::class, 'webhook'])
    ->name('paypal.webhook');

Route::get('/courses', [CourseController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Read operations for courses, sections, and lessons
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::get('/courses/{course}/sections', [SectionController::class, 'index']);
    Route::get('/sections/{section}', [SectionController::class, 'show']);
    Route::get('/sections/{section}/lessons', [LessonController::class, 'index']);
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);

    // Write operations restricted to instructor and admin
    Route::middleware('role:instructor,admin')->group(function () {
        Route::post('/courses', [CourseController::class, 'store']);
        Route::match(['put', 'patch'], '/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
        
        Route::post('/courses/{course}/sections', [SectionController::class, 'store']);
        Route::match(['put', 'patch'], '/sections/{section}', [SectionController::class, 'update']);
        Route::delete('/sections/{section}', [SectionController::class, 'destroy']);
        
        Route::post('/sections/{section}/lessons', [LessonController::class, 'store']);
        Route::match(['put', 'patch'], '/lessons/{lesson}', [LessonController::class, 'update']);
        Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy']);
    });

    // PayPal checkout
    Route::post('/v1/orders/checkout', [PayPalController::class, 'checkout']);
    Route::get('/v1/orders/{order}/status', [PayPalController::class, 'status']);
    Route::prefix('v1')->group(function () {
        Route::get('/lessons/{lesson}/hls-key', [HlsController::class, 'key']);
        Route::get('/lessons/{lesson}/hls/{asset}', [HlsController::class, 'asset'])->where('asset', '.*')->name('lessons.hls');
        Route::get('/lessons/{lesson}/attachment', [PrivateFileController::class, 'lessonAttachment'])->name('lessons.attachment');
        Route::post('/lessons/{lesson}/video/chunk', [VideoUploadController::class, 'chunk']);
        Route::post('/lessons/{lesson}/video/complete', [VideoUploadController::class, 'complete']);
    });

    Route::prefix('student')->middleware('role:student')->group(function () {
        Route::get('/parents', [ParentLinkController::class, 'studentParents']);
        Route::post('/parent-invitations', [ParentLinkController::class, 'createInvitation']);
        Route::post('/parents/{parent}/approve', [ParentLinkController::class, 'approve']);
        Route::get('/quizzes/{quiz}/attempt', [QuizController::class, 'attempt']);
        Route::post('/quizzes/{quiz}/attempt', [QuizController::class, 'submit']);
    });
    Route::prefix('parent')->middleware('role:parent')->group(function () {
        Route::post('/invitations/accept', [ParentLinkController::class, 'acceptInvitation']);
        Route::get('/dashboard', [ParentDashboardController::class, 'index']);
        Route::get('/children/{student}/quiz-reports', [QuizController::class, 'parentReports']);
    });
    Route::get('/instructor/courses/{course}/quiz-analytics', [QuizController::class, 'analytics'])
        ->middleware('role:instructor,admin');
    Route::middleware('role:instructor')->prefix('instructor')->group(function () {
        Route::get('/wallet', [InstructorPayoutController::class, 'balance']);
        Route::get('/payouts', [PayoutController::class, 'index']);
        Route::post('/payouts', [PayoutController::class, 'store']);
    });

    Route::middleware('role:student')->group(function () {
        Route::get('/student/enrollments', [StudentController::class, 'enrollments']);
        Route::post('/student/lessons/{lesson}/complete', [StudentController::class, 'toggleLessonComplete']);
    });

    // Admin Routes
    Route::middleware([IsAdmin::class])->prefix('admin')->group(function () {
        Route::get('/courses', [AdminController::class, 'pendingCourses']);
        Route::patch('/courses/{course}/status', [AdminController::class, 'updateCourseStatus']);
        Route::get('/payouts', [AdminPayoutController::class, 'index']);
        Route::patch('/payouts/{payoutRequest}', [AdminPayoutController::class, 'update']);
        Route::get('/users', [AdminController::class, 'users']);
    });
});
