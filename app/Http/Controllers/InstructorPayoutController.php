<?php

namespace App\Http\Controllers;

use App\Models\InstructorWallet;
use Illuminate\Http\Request;

class InstructorPayoutController extends Controller
{
    public function balance(Request $request)
    {
        $wallet = InstructorWallet::firstOrCreate(['instructor_id' => $request->user()->id]);
        return response()->json(['data' => $wallet]);
    }
}
