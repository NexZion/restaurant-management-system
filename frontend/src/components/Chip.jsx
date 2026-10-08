const toneClasses = {
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300",
  blue:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-[#5E6AD2]/30 dark:bg-[#5E6AD2]/15 dark:text-[#828FFF]",
  default:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-white/5 dark:bg-[#121314] dark:text-[#D0D6E0]",
  amber:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300",
  red:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-300",
  violet:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-300",
  slate:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/5 dark:bg-[#121314] dark:text-[#D0D6E0]",
};

const statusToneMap = {
  active: "emerald",
  available: "emerald",
  completed: "emerald",
  paid: "emerald",
  ready: "emerald",
  pending: "amber",
  processing: "amber",
  cooking: "amber",
  queued: "amber",
  warning: "amber",
  inactive: "slate",
  draft: "slate",
  disabled: "slate",
  cancelled: "red",
  canceled: "red",
  blocked: "red",
  failed: "red",
  critical: "red",
  reserved: "violet",
  manager: "violet",
  admin: "violet",
  delivery: "blue",
  serving: "blue",
  open: "blue",
};

export const Chip = ({
  children,
  label,
  tone,
  status,
  size = "medium",
  onClear,
  className = "",
}) => {
  const text = children ?? label ?? status;
  const normalizedStatus = String(status ?? text ?? "").toLowerCase();
  const selectedTone = tone || statusToneMap[normalizedStatus] || "slate";
  const sizeClasses =
    size === "small"
      ? "min-h-6 px-2 py-0.5 text-[11px]"
      : "min-h-7 px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border font-medium capitalize ${sizeClasses} ${toneClasses[selectedTone] || toneClasses.slate} ${className}`}
    >
      <span className="truncate">{text || "Status"}</span>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="-mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-current opacity-70 transition hover:bg-current/10 hover:opacity-100"
          aria-label={`Clear ${text || "status"}`}
        >
          <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};
