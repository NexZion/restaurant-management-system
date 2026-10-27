<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class VariantController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Variant::with('options')->orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $variant = DB::transaction(function () use ($data) {
            $options = $data['options'];
            unset($data['options']);
            $variant = Variant::create($data);
            $variant->options()->createMany($options);
            return $variant->load('options');
        });
        return response()->json(['success' => true, 'data' => $variant], 201);
    }

    public function show(Variant $variant)
    {
        return response()->json(['success' => true, 'data' => $variant->load('options')]);
    }

    public function update(Request $request, Variant $variant)
    {
        $data = $this->validated($request, $variant);
        DB::transaction(function () use ($data, $variant) {
            $options = $data['options'];
            unset($data['options']);
            $variant->update($data);
            $keptIds = [];
            foreach ($options as $option) {
                $id = $option['id'] ?? null;
                unset($option['id']);
                if ($id) {
                    $variant->options()->whereKey($id)->update($option);
                    $keptIds[] = $id;
                } else {
                    $keptIds[] = $variant->options()->create($option)->id;
                }
            }
            $variant->options()->whereNotIn('id', $keptIds)->delete();
        });
        return response()->json(['success' => true, 'data' => $variant->fresh()->load('options')]);
    }

    public function destroy(Variant $variant)
    {
        $variant->delete();
        return response()->json(['success' => true, 'message' => 'Variant deleted.']);
    }

    private function validated(Request $request, ?Variant $variant = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', Rule::unique('variants', 'code')->ignore($variant?->id)],
            'selection_type' => ['required', Rule::in(['single', 'multiple'])],
            'min_select' => ['required', 'integer', 'min:0'],
            'max_select' => ['required', 'integer', 'min:1', 'gte:min_select'],
            'is_active' => ['required', 'boolean'],
            'options' => ['required', 'array', 'min:1'],
            'options.*.id' => ['nullable', 'integer', 'distinct', Rule::exists('variant_options', 'id')->where('variant_id', $variant?->id ?? 0)],
            'options.*.name' => ['required', 'string', 'max:100'],
            'options.*.code' => ['required', 'string', 'max:50', 'distinct'],
            'options.*.default_additional_price' => ['required', 'numeric', 'min:0'],
            'options.*.is_active' => ['required', 'boolean'],
            'options.*.display_order' => ['required', 'integer', 'min:0'],
        ]);

        if (($data['selection_type'] === 'single' && (int) $data['max_select'] !== 1)
            || (int) $data['max_select'] > count($data['options'])) {
            throw ValidationException::withMessages([
                'max_select' => 'The maximum selection count must fit the selection type and available options.',
            ]);
        }

        return $data;
    }
}
