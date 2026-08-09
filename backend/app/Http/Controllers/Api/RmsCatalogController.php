<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreRmsCatalogRequest;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\BranchMenuItem;
use App\Models\CashierShift;
use App\Models\CustomerAddress;
use App\Models\DocumentSequence;
use App\Models\MenuItemModifierGroup;
use App\Models\MenuItemVariant;
use App\Models\ModifierGroup;
use App\Models\ModifierOption;
use App\Models\Permission;
use App\Models\PosTerminal;
use App\Models\Printer;
use App\Models\ReasonCode;
use App\Models\ReservationTable;
use App\Models\RestaurantFloor;
use App\Models\RestaurantSection;
use App\Models\Tax;
use App\Models\VariantAttribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

class RmsCatalogController extends Controller
{
    private const MODELS = [
        'menu-item-variants' => MenuItemVariant::class, 'attributes' => Attribute::class,
        'attribute-values' => AttributeValue::class, 'variant-attributes' => VariantAttribute::class,
        'modifier-groups' => ModifierGroup::class, 'modifier-options' => ModifierOption::class,
        'menu-item-modifier-groups' => MenuItemModifierGroup::class,
        'reservation-tables' => ReservationTable::class, 'restaurant-sections' => RestaurantSection::class,
        'restaurant-floors' => RestaurantFloor::class, 'taxes' => Tax::class,
        'branch-menu-items' => BranchMenuItem::class, 'pos-terminals' => PosTerminal::class,
        'cashier-shifts' => CashierShift::class,
        'customer-addresses' => CustomerAddress::class, 'printers' => Printer::class,
        'permissions' => Permission::class, 'reason-codes' => ReasonCode::class,
        'document-sequences' => DocumentSequence::class,
    ];

    public function index(IndexFilterRequest $request): JsonResponse
    {
        $model = $this->newModel($request);
        $columns = array_merge(['id'], $model->getFillable(), ['created_at', 'updated_at']);
        $searchable = array_values(array_intersect($columns, [
            'name', 'display_name', 'display_value', 'sku', 'code', 'label',
            'category', 'document_type', 'prefix', 'city', 'address_line_1',
        ]));

        return response()->json([
            'success' => true,
            'data' => $this->filterAndPaginate($model->newQuery(), $request, $columns, $searchable),
        ]);
    }

    public function store(StoreRmsCatalogRequest $request): JsonResponse
    {
        $record = $this->newModel($request)->newQuery()->create($request->validated());

        return response()->json(['success' => true, 'data' => $record], 201);
    }

    public function show(IndexFilterRequest $request, int $catalog): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->newModel($request)->newQuery()->findOrFail($catalog)]);
    }

    public function update(StoreRmsCatalogRequest $request, int $catalog): JsonResponse
    {
        $record = $this->newModel($request)->newQuery()->findOrFail($catalog);
        $record->update($request->validated());

        return response()->json(['success' => true, 'data' => $record->refresh()]);
    }

    public function destroy(IndexFilterRequest $request, int $catalog): JsonResponse
    {
        $this->newModel($request)->newQuery()->findOrFail($catalog)->delete();

        return response()->json(['success' => true, 'message' => 'Deleted successfully.']);
    }

    private function newModel(IndexFilterRequest|StoreRmsCatalogRequest $request): Model
    {
        $resource = explode('.', (string) $request->route()?->getName())[0];
        $model = self::MODELS[$resource] ?? abort(404);

        return new $model;
    }
}
