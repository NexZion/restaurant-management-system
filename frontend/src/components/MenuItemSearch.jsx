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
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-950 shadow-sm outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-[#111318] dark:text-white dark:focus:border-blue-400"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {selected ? (
            <>
              {selected.image ? (
                <img
                  src={selected.image}
                  alt={selected.name}
                className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-semibold text-white shadow-sm">
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
          <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
          )}
        </div>

        <FiChevronDown
          className={`shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          size={18}
        />
      </button>

      {open && (
        <div className="absolute z-[9999] mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-[#171a21] dark:shadow-black/40">
          <div className="border-b border-slate-100 p-2 dark:border-slate-800">
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-[#111318]">
              <FiSearch className="text-gray-400" size={16} />

              <input
                type="text"
                className="h-9 w-full border-none bg-transparent px-2 text-sm text-slate-950 outline-none dark:text-white"
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
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      isSelected ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100" : ""
                    }`}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white shadow-sm">
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
