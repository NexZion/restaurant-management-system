import { useNavigate } from "react-router-dom";
import { Button } from "../../components/DataFields";
import { getAccessLevel, accessLevelLabel } from "../../utils/accessControl";

export const AccessDenied = () => {
  const navigate = useNavigate();
  const level = getAccessLevel();

  return (
    <main className="grid min-h-[65vh] place-items-center p-6">
      <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#111318]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-2xl text-red-600 dark:bg-red-500/10 dark:text-red-300">
          403
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
          Access denied
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your access level ({level} – {accessLevelLabel(level)}) does not include
          this page.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>Go back</Button>
          <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
        </div>
      </section>
    </main>
  );
};
