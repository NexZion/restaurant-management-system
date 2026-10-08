import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Reusable three-dot menu for row and card actions. */
export const ActionMenu = ({
  items = [],
  label = "Actions",
  className = "",
  menuClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

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
      const menuHeight = Math.min(items.length * 36 + 10, window.innerHeight - 16);
      const menuWidth = 144;
      const maxLeft = Math.max(8, window.innerWidth - menuWidth - 8);
      const left = Math.min(maxLeft, Math.max(8, rect.right - menuWidth));
      const belowTop = rect.bottom + 4;
      const top = belowTop + menuHeight <= window.innerHeight - 8
        ? belowTop
        : Math.max(8, rect.top - menuHeight - 4);

      setMenuPosition({ top, left, maxHeight: window.innerHeight - 16 });
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
  }, [isOpen, items.length]);

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
            maxHeight: menuPosition.maxHeight,
          }}
          className={`z-[9999] w-36 overflow-y-auto overflow-x-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-[#1F2226] dark:bg-[#121314] ${menuClassName}`}
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
              className={`w-full px-3 py-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
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
