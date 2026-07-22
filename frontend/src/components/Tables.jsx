import { useEffect, useState } from "react";

export const Table = ({
  columns = [], // Array of {key, label, sortable}
  showColumns = true,
  data = [], // Array of row objects
  selectable = false, // Enable checkboxes
  expandable = false, // Enable row expansion
  searchable = false, // Show search bar
  filterable = false, // Show filter button
  customButtons = [], // Array of custom button elements/components to show on right side
  pagination = true, // Show pagination
  rowsPerPageOptions = [5, 10, 25, 50], // Options for rows per page
  defaultRowsPerPage = 10,
  onRowSelect = null, // Callback when rows selected
  onBulkAction = null, // Callback for bulk actions
  bulkActions = [], // Array of {label, onClick} for bulk menu
  multiExpands = false,
  onRowExpandClick = null,
  renderExpandedRow = null, // Function to render expanded content
  actions = null,
  actionsAlign = "left", // Array of {icon, label, onClick} or function(row) returning array
  emptyMessage = "No data available",

  // Server-side props
  serverSide = false, // Enable server-side pagination
  totalRows = 0, // Total rows from server
  currentPage: externalPage = 1, // Current page from parent
  onPageChange = null, // Callback for page change
  onRowsPerPageChange = null, // Callback for rows per page change
  onSearchChange = null, // Callback for search change
  onSortChange = null, // Callback for sort change
  loading = false, // Loading state
  sortSelectOptions = [], // Array of { value, label, key, direction }
  sortSelectValue = "", // Optional controlled selected sort option value
  sortSelectPlaceholder = "Sort by", // Sort select placeholder label
  onSortSelectChange = null, // Callback when sort option changes
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [internalPage, setInternalPage] = useState(1);
  const [internalRowsPerPage, setInternalRowsPerPage] =
    useState(defaultRowsPerPage);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [internalSortSelectValue, setInternalSortSelectValue] = useState(
    sortSelectValue || "",
  );

  useEffect(() => {
    setInternalSortSelectValue(sortSelectValue || "");
  }, [sortSelectValue]);

  // Use external or internal state based on serverSide mode
  const currentPage = serverSide ? externalPage : internalPage;
  const rowsPerPage = serverSide ? defaultRowsPerPage : internalRowsPerPage;

  // Filter data based on search (client-side only)
  const filteredData = serverSide
    ? data
    : searchable && searchQuery
      ? data.filter((row) =>
          Object.values(row).some((val) =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        )
      : data;

  // Sort data (client-side only)
  const sortedData = serverSide
    ? data
    : [...filteredData].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });

  // Paginate data
  const totalCount = serverSide ? totalRows : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = serverSide
    ? data
    : pagination
      ? sortedData.slice(startIndex, startIndex + rowsPerPage)
      : sortedData;

  // Handle select all
  const handleSelectAll = (e) => {
    const isChecked =
      e?.target?.checked !== undefined ? e.target.checked : !isAllSelected;
    if (isChecked) {
      setSelectedRows(paginatedData.map((_, index) => startIndex + index));
    } else {
      setSelectedRows([]);
    }
    onRowSelect?.(isChecked ? paginatedData : []);
  };

  // Handle row select
  const handleRowSelect = (rowIndex, row) => {
    const newSelected = selectedRows.includes(rowIndex)
      ? selectedRows.filter((i) => i !== rowIndex)
      : [...selectedRows, rowIndex];

    setSelectedRows(newSelected);
    onRowSelect?.(newSelected.map((i) => sortedData[i]));
  };

  // Handle row expand
  const handleRowExpand = (rowIndex) => {
    setExpandedRows((prev) => {
      const isExpanded = prev.includes(rowIndex);

      if (isExpanded) {
        return prev.filter((i) => i !== rowIndex);
      }

      return multiExpands ? [...prev, rowIndex] : [rowIndex];
    });
  };

  // Handle sort
  const handleSort = (columnKey) => {
    const newDirection =
      sortConfig.key === columnKey && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key: columnKey, direction: newDirection });

    if (serverSide && onSortChange) {
      onSortChange(columnKey, newDirection);
    }
  };

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (serverSide && onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalPage(1);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    // Ensure page is within valid bounds
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    if (serverSide && onPageChange) {
      onPageChange(validPage);
    } else {
      setInternalPage(validPage);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (serverSide && onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(1);
    }
  };

  const handleSortSelectChange = (value) => {
    setInternalSortSelectValue(value);

    const selectedOption = sortSelectOptions.find(
      (option) => String(option.value) === String(value),
    );
    if (!selectedOption) {
      onSortSelectChange?.(value, null);
      return;
    }

    if (selectedOption.key) {
      const nextDirection = selectedOption.direction || "asc";
      setSortConfig({ key: selectedOption.key, direction: nextDirection });

      if (serverSide && onSortChange) {
        onSortChange(selectedOption.key, nextDirection);
      }
    }

    onSortSelectChange?.(value, selectedOption);
  };

  const isAllSelected =
    paginatedData.length > 0 && selectedRows.length === paginatedData.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Controls */}
      {(sortSelectOptions.length > 0 ||
        searchable ||
        filterable ||
        customButtons.length > 0 ||
        (selectable && selectedRows.length > 0)) && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-[#111318]/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-1">
            {/* Search Bar */}
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-[#171a21] dark:text-white dark:focus:border-blue-400"
                />
              </div>
            )}

            {/* Bulk Actions Menu */}
            {selectable && selectedRows.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowBulkMenu(!showBulkMenu)}
                  className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {showBulkMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowBulkMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 min-w-[150px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-[#171a21] dark:shadow-black/40">
                      <div className="py-1">
                        {bulkActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              action.onClick(
                                selectedRows.map((i) => sortedData[i]),
                              );
                              setShowBulkMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-900 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-2">
            {/* Sort Select */}
            {sortSelectOptions.length > 0 && (
              <div className="relative">
                <select
                  aria-label={sortSelectPlaceholder}
                  value={internalSortSelectValue}
                  onChange={(e) => handleSortSelectChange(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-10 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-[#171a21] dark:text-white dark:focus:border-blue-400"
                >
                  {sortSelectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            )}

            {/* Custom Buttons */}
            {customButtons.map((button, index) => (
              <div key={index}>{button}</div>
            ))}

            {/* Filter Button */}
            {filterable && (
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Count */}
      {selectable && selectedRows.length > 0 && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200">
          {selectedRows.length} item(s) selected
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111318]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-white"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#171a21]">
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="sr-only"
                        id="table-select-all"
                      />
                      <div
                        onClick={() =>
                          handleSelectAll({
                            target: { checked: !isAllSelected },
                          })
                        }
                        className={`
                        flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200
                        ${
                          isAllSelected
                            ? "border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400"
                            : "border-slate-300 hover:border-blue-500 dark:border-slate-600 dark:hover:border-blue-400"
                        }
                      `}
                      >
                        {isAllSelected && (
                          <svg
                            className="h-3.5 w-3.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </th>
                )}
                {expandable && <th className="w-12"></th>}
                {showColumns && (
                  <>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                      >
                        <div className="flex items-center gap-2">
                          <span>{col.label}</span>

                          {col.sortable && (
                            <button
                              onClick={() => handleSort(col.key)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </th>
                    ))}

                    {actions && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-[#111318]">
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, idx) => (
                  <tr key={idx}>
                    <td
                      colSpan={
                        columns.length +
                        (selectable ? 1 : 0) +
                        (expandable ? 1 : 0) +
                        (actions ? 1 : 0)
                      }
                      className="px-4 py-6 text-center"
                    >
                      {idx === Math.floor(rowsPerPage / 2) ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-white"></div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (expandable ? 1 : 0) +
                      (actions ? 1 : 0)
                    }
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => {
                  const actualIndex = startIndex + rowIndex;
                  const isSelected = selectedRows.includes(actualIndex);
                  const isExpanded = expandedRows.includes(actualIndex);

                  return (
                    <>
                      <tr
                        key={actualIndex}
                        className={`${isSelected ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"} transition-colors`}
                      >
                        {selectable && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleRowSelect(actualIndex, row)
                                }
                                className="sr-only"
                                id={`table-row-${actualIndex}`}
                              />
                              <div
                                onClick={() =>
                                  handleRowSelect(actualIndex, row)
                                }
                                className={`
                                flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200
                                ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400"
                                    : "border-slate-300 hover:border-blue-500 dark:border-slate-600 dark:hover:border-blue-400"
                                }
                              `}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3.5 h-3.5 text-white dark:text-gray-900"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </td>
                        )}
                        {expandable && (
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                handleRowExpand(actualIndex)
                                onRowExpandClick?.(row, actualIndex)
                              }}
                            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </td>
                        )}
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className="px-4 py-3 text-sm text-slate-900 dark:text-white"
                          >
                            {row[col.key]}
                          </td>
                        ))}
                        {actions && (
                          <td className="px-4 py-3 text-right">
                            <div
                              className={`flex items-center gap-2 ${
                                actionsAlign === "right"
                                  ? "justify-end"
                                  : actionsAlign === "center"
                                    ? "justify-center"
                                    : "justify-start"
                              }`}
                            >
                              {(typeof actions === "function"
                                ? actions(row, actualIndex)
                                : actions
                              ).map((action, idx) => (
                                <button
                                  key={idx}
                                  onClick={() =>
                                    action.onClick(row, actualIndex)
                                  }
                                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                                  title={action.label}
                                >
                                  {action.icon}
                                </button>
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                      {expandable && isExpanded && renderExpandedRow && (
                        <tr>
                          <td
                            colSpan={
                              columns.length +
                              (selectable ? 1 : 0) +
                              (actions ? 1 : 0) +
                              1
                            }
                            className="px-4 py-3"
                          >
                            {renderExpandedRow(row, actualIndex)}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-[#111318]/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Rows per page:
            </span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) =>
                  handleRowsPerPageChange(Number(e.target.value))
                }
                className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 pr-8 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-[#171a21] dark:text-white dark:focus:border-blue-400"
              >
                {rowsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 ml-4">
              {totalCount > 0
                ? `${startIndex + 1}-${Math.min(startIndex + rowsPerPage, totalCount)} of ${totalCount}`
                : "0 of 0"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
