import { Link, useLocation } from "react-router-dom";

const title = (part) =>
  part.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length || pathname === "/dashboard") return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <Link to="/dashboard" className="font-medium hover:text-blue-600">Home</Link>
      {parts.map((part, index) => {
        const path = `/${parts.slice(0, index + 1).join("/")}`;
        const last = index === parts.length - 1;
        return (
          <span key={path} className="flex items-center gap-2">
            <span>/</span>
            {last ? <span className="font-semibold text-slate-800 dark:text-slate-200">{title(part)}</span> : <Link to={path} className="hover:text-blue-600">{title(part)}</Link>}
          </span>
        );
      })}
    </nav>
  );
};
