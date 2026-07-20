const toneClasses = {
  emerald:
    "border-emerald-300 bg-emerald-100 text-emerald-800 shadow-emerald-500/10 ring-1 ring-emerald-200/70 dark:border-emerald-400/35 dark:bg-emerald-400/18 dark:text-emerald-200 dark:shadow-emerald-950/20 dark:ring-emerald-400/20",
  blue:
    "border-blue-300 bg-blue-100 text-blue-800 shadow-blue-500/10 ring-1 ring-blue-200/70 dark:border-blue-400/35 dark:bg-blue-400/18 dark:text-blue-200 dark:shadow-blue-950/20 dark:ring-blue-400/20",
  default:
    "border-blue-300 bg-blue-100 text-blue-800 shadow-blue-500/10 ring-1 ring-blue-200/70 dark:border-blue-400/35 dark:bg-blue-400/18 dark:text-blue-200 dark:shadow-blue-950/20 dark:ring-blue-400/20",
  amber:
    "border-amber-300 bg-amber-100 text-amber-900 shadow-amber-500/10 ring-1 ring-amber-200/70 dark:border-amber-400/35 dark:bg-amber-400/18 dark:text-amber-200 dark:shadow-amber-950/20 dark:ring-amber-400/20",
  red:
    "border-red-300 bg-red-100 text-red-800 shadow-red-500/10 ring-1 ring-red-200/70 dark:border-red-400/35 dark:bg-red-400/18 dark:text-red-200 dark:shadow-red-950/20 dark:ring-red-400/20",
  violet:
    "border-violet-300 bg-violet-100 text-violet-800 shadow-violet-500/10 ring-1 ring-violet-200/70 dark:border-violet-400/35 dark:bg-violet-400/18 dark:text-violet-200 dark:shadow-violet-950/20 dark:ring-violet-400/20",
  slate:
    "border-slate-300 bg-slate-200 text-slate-800 shadow-slate-500/10 ring-1 ring-slate-300/70 dark:border-white/15 dark:bg-white/14 dark:text-slate-200 dark:shadow-black/20 dark:ring-white/10",
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
      ? "min-h-7 px-2.5 py-1 text-xs"
      : "min-h-8 px-3 py-1.5 text-sm";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border font-semibold capitalize shadow-sm ${sizeClasses} ${toneClasses[selectedTone] || toneClasses.slate} ${className}`}
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
