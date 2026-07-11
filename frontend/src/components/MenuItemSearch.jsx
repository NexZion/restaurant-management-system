import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";

const normalizeMenuItem = (item) => ({
  id: item?.id ?? item?.value ?? item?.name ?? "",
  name: item?.name ?? item?.label ?? "Unnamed item",
  image: item?.image || item?.thumbnail || item?.image_url || "",
  category: item?.category?.name ?? item?.category ?? item?.categoryName ?? "Uncategorized",
  price: item?.price ?? item?.unit_price ?? 0,
});

export default function MenuItemSearch({
  items = [],
  value,
  onChange,
  label = "Menu Item",
  placeholder = "Search menu item...",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const itemList = useMemo(
    () => (Array.isArray(items) ? items.map(normalizeMenuItem) : []),
    [items]
  );

  const selected = itemList.find((item) => String(item?.id) === String(value));

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return itemList.filter((item) => {
      const itemName = (item?.name ?? "").toString().toLowerCase();
      const categoryName = (item?.category ?? "").toString().toLowerCase();

      return (
        !keyword || itemName.includes(keyword) || categoryName.includes(keyword)
      );
    });
  }, [itemList, search]);

  const handleSelect = (item) => {
    onChange?.(item);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative z-50 w-full overflow-visible" ref={wrapperRef}>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-left text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:bg-[#18181B] dark:text-white dark:focus:border-white"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {selected ? (
            <>
              {selected.image ? (
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-500 text-xs font-semibold text-white">
                  {selected.name?.slice(0, 2)?.toUpperCase() || "IT"}
                </div>
              )}

              <div className="min-w-0 text-left">
                <div className="truncate font-semibold text-gray-900 dark:text-white">
                  {selected.name}
                </div>
                <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {selected.category}
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
        </div>

        <FiChevronDown
          className={`shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          size={18}
        />
      </button>

      {open && (
        <div className="absolute z-[9999] mt-1 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-2xl dark:border-gray-600 dark:bg-[#212125]">
          <div className="border-b border-gray-200 p-2 dark:border-gray-700">
            <div className="flex items-center rounded border border-gray-200 bg-gray-50 px-2 dark:border-gray-700 dark:bg-[#18181B]">
              <FiSearch className="text-gray-400" size={16} />

              <input
                type="text"
                className="h-9 w-full border-none bg-transparent px-2 text-sm text-gray-900 outline-none dark:text-white"
                placeholder="Search item or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div
            className="max-h-72 overflow-y-auto overscroll-contain"
            style={{ scrollbarGutter: "stable" }}
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                No menu items found
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = String(item?.id) === String(value);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      isSelected ? "bg-blue-50 dark:bg-gray-700" : ""
                    }`}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-300 to-slate-500 text-xs font-bold text-white">
                        {item.name?.slice(0, 2)?.toUpperCase() || "IT"}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {item.category}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
