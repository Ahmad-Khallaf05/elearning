<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePayoutRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'instructor'; }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:'.config('lms.minimum_payout'), 'decimal:0,2'],
            'payout_method' => ['required', Rule::in(['bank_transfer', 'paypal'])],
            'payout_details' => ['required', 'array'],
            'payout_details.account' => ['required', 'string', 'max:255'],
        ];
    }
}
