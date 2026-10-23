import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Reusable three-dot menu for row and card actions. */
export const ActionMenu = ({
  items = [],
  label = "Actions",
  className = "",
  menuClassName = "",
  menuWidth = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const contentWidth = menuWidth ?? Math.max(
    144,
    ...items.map((item) => String(item.label ?? "").length * 7 + 24),
  );

  const closeMenu = () => {
    setIsOpen(false);
    setMenuPosition(null);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const maxHeight = Math.max(0, viewportHeight - 16);
      const menuHeight = Math.min(items.length * 28 + 10, maxHeight);
      const availableWidth = Math.max(0, window.innerWidth - 16);
      const width = Math.min(contentWidth, availableWidth);
      const maxLeft = Math.max(8, window.innerWidth - width - 8);
      const left = Math.min(maxLeft, Math.max(8, rect.right - width));
      const belowTop = rect.bottom + 4;
      const top = belowTop + menuHeight <= viewportHeight - 8
        ? belowTop
        : Math.max(8, Math.min(rect.top - menuHeight - 4, viewportHeight - menuHeight - 8));

      setMenuPosition({ top, left, width, maxHeight });
    };

    const closeOnOutsideClick = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) closeMenu();
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    updatePosition();
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, items, contentWidth]);

  return (
    <div
      className={`relative ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          if (isOpen) closeMenu();
          else setIsOpen(true);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-[#8A8F98] dark:hover:bg-[#1A1C20] dark:hover:text-[#F7F8F8]"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
        </svg>
      </button>
      {isOpen && menuPosition && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "fixed",
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
          }}
          className={`z-[9999] flex flex-col overflow-y-auto overflow-x-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-[#1F2226] dark:bg-[#121314] ${menuClassName}`}
        >
          {items.map((item, index) => (
            <button
              key={item.key ?? item.label ?? index}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                closeMenu();
                item.onClick?.();
              }}
              className={`block w-full shrink-0 whitespace-nowrap px-3 py-1.5 text-left text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                item.variant === "danger"
                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  : "text-slate-700 hover:bg-slate-50 dark:text-[#D0D6E0] dark:hover:bg-[#1A1C20]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default ActionMenu;
