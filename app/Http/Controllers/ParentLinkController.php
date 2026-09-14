<?php

namespace App\Http\Controllers;

use App\Models\ParentLinkInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ParentLinkController extends Controller
{
    public function createInvitation(Request $request)
    {
        abort_unless($request->user()->role === 'student', 403);
        $token = Str::random(48);
        ParentLinkInvitation::create([
            'student_id' => $request->user()->id,
            'token_hash' => Hash::make($token),
            'expires_at' => now()->addDays(7),
        ]);
        return response()->json(['token' => $token, 'expires_at' => now()->addDays(7)] , 201);
    }

    public function acceptInvitation(Request $request)
    {
        abort_unless($request->user()->role === 'parent', 403);
        $data = $request->validate(['token' => 'required|string']);
        $invitation = ParentLinkInvitation::whereNull('accepted_at')->where('expires_at', '>', now())->latest()->get()
            ->first(fn ($item) => Hash::check($data['token'], $item->token_hash));
        abort_unless($invitation, 404, __('messages.invitation_not_found'));
        $request->user()->children()->syncWithoutDetaching([$invitation->student_id => ['status' => 'pending']]);
        $invitation->update(['accepted_at' => now()]);
        return response()->json(['message' => __('messages.invitation_pending')]);
    }

    public function approve(Request $request, int $parent)
    {
        abort_unless($request->user()->role === 'student', 403);
        abort_unless($request->user()->parents()->where('users.id', $parent)->exists(), 404);
        $request->user()->parents()->updateExistingPivot($parent, ['status' => 'approved']);
        return response()->json(['message' => __('messages.link_approved')]);
    }

    public function studentParents(Request $request)
    {
        abort_unless($request->user()->role === 'student', 403);
        
        $parents = $request->user()->parents()->get()->map(function ($parent) {
            return [
                'id' => $parent->id,
                'name' => $parent->name,
                'email' => $parent->email,
                'status' => $parent->pivot->status,
            ];
        });

        return response()->json(['data' => $parents]);
    }
}
