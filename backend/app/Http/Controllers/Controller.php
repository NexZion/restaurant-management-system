<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexFilterRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

abstract class Controller
{
    /**
     * @param  list<string>  $filterableColumns
     * @param  list<string>  $searchableColumns
     */
    protected function filterAndPaginate(
        Builder|Relation $query,
        IndexFilterRequest $request,
        array $filterableColumns,
        array $searchableColumns = [],
    ): LengthAwarePaginator {
        $validated = $request->validated();
        $model = $query instanceof Builder ? $query->getModel() : $query->getRelated();

        foreach ($validated['filters'] ?? [] as $column => $value) {
            if (! in_array($column, $filterableColumns, true)) {
                continue;
            }

            $qualifiedColumn = $model->qualifyColumn($column);

            if ($value === 'null') {
                $query->whereNull($qualifiedColumn);

                continue;
            }

            $query->where($qualifiedColumn, $value);
        }

        if (! empty($validated['search']) && $searchableColumns !== []) {
            $search = $validated['search'];
            $query->where(function (Builder $searchQuery) use ($search, $searchableColumns): void {
                foreach ($searchableColumns as $column) {
                    $searchQuery->orWhere(
                        $searchQuery->getModel()->qualifyColumn($column),
                        'like',
                        '%'.$search.'%',
                    );
                }
            });
        }

        $sortBy = in_array($validated['sort_by'] ?? null, $filterableColumns, true)
            ? $validated['sort_by']
            : (in_array('created_at', $filterableColumns, true) ? 'created_at' : 'id');

        return $query
            ->orderBy($model->qualifyColumn($sortBy), $validated['sort_direction'] ?? 'desc')
            ->paginate($validated['per_page'] ?? 15)
            ->withQueryString();
    }
}
