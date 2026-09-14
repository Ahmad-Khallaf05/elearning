<?php

namespace App\Http\Controllers;

use App\Models\InstructorWallet;
use App\Models\PayoutRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPayoutController extends Controller
{
    public function index() { return response()->json(['data' => PayoutRequest::with('instructor:id,name,email')->latest()->paginate(25)->through(fn ($req) => $req->makeVisible('payout_details'))]); }

    public function update(Request $request, PayoutRequest $payoutRequest)
    {
        $data = $request->validate(['status' => 'required|in:processed,rejected', 'admin_note' => 'nullable|string|max:2000']);
        abort_if($payoutRequest->status !== 'pending', 409, 'Payout request has already been reviewed.');
        DB::transaction(function () use ($payoutRequest, $data, $request) {
            $wallet = InstructorWallet::where('instructor_id', $payoutRequest->instructor_id)->lockForUpdate()->firstOrFail();
            if ($data['status'] === 'processed') {
                abort_unless((float) $wallet->balance >= (float) $payoutRequest->amount, 422, 'Insufficient wallet balance.');
                $wallet->decrement('balance', $payoutRequest->amount);
            }
            $payoutRequest->update([...$data, 'processed_by' => $request->user()->id, 'processed_at' => now()]);
        });
        return response()->json(['data' => $payoutRequest->fresh()]);
    }
}
