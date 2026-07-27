<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreBusinessModuleRequest;
use App\Models\Account;
use App\Models\Coupon;
use App\Models\InventoryItem;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\LoyaltyTransaction;
use App\Models\Promotion;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\ReservationDeposit;
use App\Models\StockLevel;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Wastage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;

class BusinessModuleController extends Controller
{
    private const MODELS = [
        'promotions' => Promotion::class, 'coupons' => Coupon::class,
        'reservation-deposits' => ReservationDeposit::class, 'inventory-items' => InventoryItem::class,
        'stock-levels' => StockLevel::class, 'stock-movements' => StockMovement::class,
        'suppliers' => Supplier::class, 'purchase-orders' => PurchaseOrder::class,
        'purchase-order-items' => PurchaseOrderItem::class, 'recipes' => Recipe::class,
        'recipe-ingredients' => RecipeIngredient::class, 'wastages' => Wastage::class,
        'loyalty-transactions' => LoyaltyTransaction::class, 'accounts' => Account::class,
        'journal-entries' => JournalEntry::class, 'journal-entry-lines' => JournalEntryLine::class,
    ];

    public function index(IndexFilterRequest $request): JsonResponse
    {
        $model = $this->model($request);
        $query = $model->newQuery();
        if (in_array('branch_id', $model->getFillable(), true)) {
            $query->where('branch_id', $request->user()->branch_id);
        }
        $columns = array_merge(['id'], $model->getFillable(), ['created_at', 'updated_at']);

        return response()->json(['success' => true, 'data' => $this->filterAndPaginate(
            $query, $request, $columns,
            array_values(array_intersect($columns, ['name', 'code', 'sku', 'status', 'description', 'movement_type', 'type', 'purchase_order_number', 'entry_number'])),
        )]);
    }

    public function store(StoreBusinessModuleRequest $request): JsonResponse
    {
        $record = $this->model($request)->newQuery()->create($request->validated());

        return response()->json(['success' => true, 'data' => $record], 201);
    }

    public function show(IndexFilterRequest $request, int $module): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->find($request, $module)]);
    }

    public function update(StoreBusinessModuleRequest $request, int $module): JsonResponse
    {
        $record = $this->find($request, $module);
        $record->update($request->validated());

        return response()->json(['success' => true, 'data' => $record->refresh()]);
    }

    public function destroy(IndexFilterRequest $request, int $module): JsonResponse
    {
        $this->find($request, $module)->delete();

        return response()->json(['success' => true, 'message' => 'Deleted successfully.']);
    }

    private function find(IndexFilterRequest|StoreBusinessModuleRequest $request, int $id): Model
    {
        $model = $this->model($request);
        $query = $model->newQuery();
        if (in_array('branch_id', $model->getFillable(), true)) {
            $query->where('branch_id', $request->user()->branch_id);
        }

        return $query->findOrFail($id);
    }

    private function model(IndexFilterRequest|StoreBusinessModuleRequest $request): Model
    {
        $resource = explode('.', (string) $request->route()?->getName())[0];
        $class = self::MODELS[$resource] ?? abort(404);

        return new $class;
    }
}
