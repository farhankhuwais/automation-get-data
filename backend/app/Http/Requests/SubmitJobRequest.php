<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SubmitJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'durasi' => 'required|integer|min:1|max:300',
        ];
    }

    public function messages(): array
    {
        return [
            'durasi.required' => 'Duration is required',
            'durasi.integer' => 'Duration must be an integer',
            'durasi.min' => 'Duration must be at least 1 second',
            'durasi.max' => 'Duration cannot exceed 300 seconds (5 minutes)',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422));
    }
}
