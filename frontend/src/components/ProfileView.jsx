import { Chip } from "./Chip";

const emptyValue = "Not provided";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return emptyValue;
  return value;
};

const getInitials = (name = "") =>
  String(name || "NA")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NA";

export const ProfileView = ({
  title,
  subtitle,
  avatar,
  avatarAlt = "",
  badges = [],
  highlights = [],
  sections = [],
}) => {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_45px_-38px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-[#11151d]">
        <div className="relative border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/70 px-5 py-5 dark:border-white/10 dark:from-[#151a23] dark:via-[#11151d] dark:to-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-slate-100 text-xl font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10 sm:size-24 sm:text-2xl">
              {avatar ? (
                <img
                  src={avatar}
                  alt={avatarAlt || title || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getInitials(title)}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-2xl font-bold text-slate-950 dark:text-white">
                    {formatValue(title)}
                  </h3>
                  <p className="mt-1 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                    {formatValue(subtitle)}
                  </p>
                </div>

                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <Chip
                        key={`${badge.label}-${badge.value}`}
                        status={badge.value}
                        tone={badge.tone}
                        size="small"
                      >
                        {badge.label ? `${badge.label}: ` : ""}
                        {formatValue(badge.value)}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {highlights.length > 0 && (
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/6"
                >
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatValue(item.value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {section.title}
            </h4>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <div
                key={item.label}
                className={`rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/5 ${
                  item.wide ? "sm:col-span-2" : ""
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-normal text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-white">
                  {formatValue(item.value)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
