<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Order;
use App\Models\Enrollment;
use App\Models\Commission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function checkout(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $user = $request->user();
        if (!$user || $user->role !== 'student') {
            return response()->json(['message' => 'Only students can check out courses.'], 403);
        }
        $course = Course::findOrFail($request->course_id);

        if ($course->approval_status !== 'approved') {
            return response()->json(['message' => 'Course is not available for purchase.'], 400);
        }

        // Check if already enrolled
        $alreadyEnrolled = Enrollment::where('student_id', $user->id)
            ->where('course_id', $course->id)
            ->exists();

        if ($alreadyEnrolled) {
            return response()->json(['message' => 'You are already enrolled in this course.'], 400);
        }

        DB::beginTransaction();

        try {
            // Create Order
            $order = Order::create([
                'student_id' => $user->id,
                'total_amount' => $course->price,
                'payment_status' => 'completed', // Mocking payment completion
            ]);

            // Create Enrollment
            $enrollment = Enrollment::create([
                'student_id' => $user->id,
                'course_id' => $course->id,
                'order_id' => $order->id,
                'access_granted_at' => now(),
            ]);

            // Create Commission (80% for instructor)
            $commissionAmount = $course->price * 0.80;
            Commission::create([
                'instructor_id' => $course->instructor_id,
                'order_id' => $order->id,
                'amount' => $commissionAmount,
                'status' => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Checkout successful, enrollment granted.',
                'order' => $order,
                'enrollment' => $enrollment,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'An error occurred during checkout.'], 500);
        }
    }
}
