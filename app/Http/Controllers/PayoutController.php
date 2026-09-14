<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePayoutRequest;
use App\Models\InstructorWallet;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayoutController extends Controller
{
    public function store(StorePayoutRequest $request)
    {
        $payout = DB::transaction(function () use ($request) {
            $wallet = InstructorWallet::where('instructor_id', $request->user()->id)->lockForUpdate()->first();
            abort_unless($wallet && (float) $wallet->balance >= (float) $request->validated('amount'), 422, 'Insufficient wallet balance.');
            $pending = PayoutRequest::where('instructor_id', $request->user()->id)->where('status', 'pending')->exists();
            abort_if($pending, 422, 'A payout request is already pending.');
            return PayoutRequest::create(['instructor_id' => $request->user()->id, ...$request->validated()]);
        });
        return response()->json(['data' => $payout], 201);
    }

    public function index(Request $request)
    {
        return response()->json(['data' => PayoutRequest::where('instructor_id', $request->user()->id)->latest()->get()]);
    }
}
