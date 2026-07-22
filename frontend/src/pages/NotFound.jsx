import { useNavigate } from "react-router-dom";
import { Button } from "../components/DataFields";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full items-center justify-center py-10">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-[#252a35] dark:bg-[#111318] dark:shadow-black/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-blue-200/60 dark:border-blue-400/10" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-cyan-200/70 dark:border-cyan-400/10" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(37,99,235,0.08),transparent_35%,rgba(14,165,233,0.08))] dark:bg-[linear-gradient(120deg,rgba(96,165,250,0.08),transparent_35%,rgba(34,211,238,0.06))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_75%_80%,rgba(14,165,233,0.10),transparent_30%)] dark:bg-[radial-gradient(circle_at_25%_20%,rgba(96,165,250,0.10),transparent_28%),radial-gradient(circle_at_75%_80%,rgba(34,211,238,0.08),transparent_30%)]" />
        </div>

        <div className="relative grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_320px] lg:items-center lg:px-12 lg:py-14">
          <div>
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200">
              Page not found
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              This route is not defined.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              The page you opened does not exist in this system. You can return
              to the dashboard and continue from the main workspace.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="primary"
                onClick={() => navigate("/dashboard")}
              >
                Go to dashboard
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(-1)}
              >
                Go back
              </Button>
            </div>
          </div>

          <div className="mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-lg border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-[#252a35] dark:bg-[#171a21]/80">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-lg border border-dashed border-slate-300 dark:border-slate-700" />
              <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50 dark:bg-blue-500/10" />
              <div className="absolute left-1/2 top-1/2 text-7xl font-extrabold tracking-tight text-blue-600 dark:text-blue-300">
                <span className="-translate-x-1/2 -translate-y-1/2 block">
                  404
                </span>
              </div>
              <div className="absolute left-7 top-8 h-3 w-3 rounded-full bg-cyan-400" />
              <div className="absolute bottom-10 right-9 h-4 w-4 rounded-full bg-blue-500" />
              <div className="absolute bottom-16 left-12 h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="absolute right-10 top-14 h-2 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
