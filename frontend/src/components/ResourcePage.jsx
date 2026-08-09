import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../axiosClient";
import {
  Button,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
  ToggleSwitch,
} from "./DataFields";
import { Dialog, useToast } from "./Popups";
import { Table } from "./Tables";

const emptyValue = (field) => {
  if (field.type === "toggle") return field.default ?? true;
  if (field.type === "number") return field.default ?? "";
  return field.default ?? "";
};

const errorMessage = (error) => {
  const errors = error?.response?.data?.errors;
  if (errors) return Object.values(errors).flat().join(" ");
  return error?.response?.data?.message || error?.message || "Request failed.";
};

const unwrapCollection = (payload) => {
  const body = payload?.data ?? payload;
  if (Array.isArray(body)) return { rows: body, total: body.length, page: 1 };
  if (Array.isArray(body?.data)) {
    return {
      rows: body.data,
      total: body.total ?? body.data.length,
      page: body.current_page ?? 1,
    };
  }
  return { rows: [], total: 0, page: 1 };
};

export const ResourcePage = ({ config }) => {
  const { showToast, ToastContainer } = useToast();
  const toastRef = useRef(showToast);
  const latestRowsRequestRef = useRef(0);
  useEffect(() => {
    toastRef.current = showToast;
  }, [showToast]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "id", direction: "desc" });
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [lookups, setLookups] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const columns = useMemo(
    () =>
      config.columns.map((column) => ({
        ...column,
        sortable: column.sortable !== false,
      })),
    [config.columns],
  );

  const loadRows = useCallback(async () => {
    const requestId = ++latestRowsRequestRef.current;
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        search: search || undefined,
        sort_by: sort.key,
        sort_direction: sort.direction,
      };
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined) params[`filters[${key}]`] = value;
      });
      const response = await api.get(config.endpoint, { params });
      const result = unwrapCollection(response.data);
      if (requestId !== latestRowsRequestRef.current) return;
      setRows(result.rows);
      setTotal(result.total);
      if (result.page !== page) setPage(result.page);
    } catch (error) {
      if (requestId === latestRowsRequestRef.current) {
        toastRef.current({ type: "error", message: errorMessage(error) });
      }
    } finally {
      if (requestId === latestRowsRequestRef.current) setLoading(false);
    }
  }, [config.endpoint, filters, page, perPage, search, sort]);

  useEffect(() => {
    const timer = window.setTimeout(loadRows, 250);
    return () => window.clearTimeout(timer);
  }, [loadRows]);

  useEffect(() => {
    const lookupFields = config.fields.filter((field) => field.lookup);
    if (!lookupFields.length) return;
    Promise.all(
      lookupFields.map(async (field) => {
        try {
          const response = await api.get(field.lookup, { params: { per_page: 100 } });
          const result = unwrapCollection(response.data);
          return [
            field.key,
            result.rows.map((item) => ({
              value: item[field.optionValue || "id"],
              label:
                item[field.optionLabel || "name"] ??
                item.code ??
                `#${item.id}`,
            })),
          ];
        } catch {
          return [field.key, []];
        }
      }),
    ).then((entries) => setLookups(Object.fromEntries(entries)));
  }, [config.fields]);

  const openCreate = () => {
    setEditing(null);
    setForm(Object.fromEntries(config.fields.map((field) => [field.key, emptyValue(field)])));
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(
      Object.fromEntries(
        config.fields.map((field) => [field.key, row[field.key] ?? emptyValue(field)]),
      ),
    );
  };

  const closeForm = () => {
    setEditing(null);
    setForm({});
  };

  const openView = async (row) => {
    setViewing(row);
    setViewLoading(true);
    try {
      const response = await api.get(`${config.endpoint}/${row.id}`);
      setViewing(response.data?.data ?? response.data);
    } catch (error) {
      setViewing(null);
      showToast({ type: "error", message: errorMessage(error) });
    } finally {
      setViewLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.fromEntries(
        config.fields
          .filter((field) => !field.readOnly)
          .map((field) => {
            let value = form[field.key];
            if (field.type === "number" && value !== "" && value !== null) {
              value = Number(value);
            }
            return [field.key, value === "" && field.nullable ? null : value];
          }),
      );
      if (editing) {
        await api.put(`${config.endpoint}/${editing.id}`, payload);
      } else {
        await api.post(config.endpoint, payload);
      }
      showToast({
        type: "success",
        message: `${config.singular || config.title.replace(/s$/, "")} ${editing ? "updated" : "created"} successfully.`,
      });
      closeForm();
      loadRows();
    } catch (error) {
      showToast({ type: "error", message: errorMessage(error), duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await api.delete(`${config.endpoint}/${confirmDelete.id}`);
      showToast({ type: "success", message: "Deleted successfully." });
      setConfirmDelete(null);
      loadRows();
    } catch (error) {
      showToast({ type: "error", message: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const runRowAction = async (action, row) => {
    if (action.confirm && !window.confirm(action.confirm(row))) return;
    let payload = action.payload ? action.payload(row) : {};
    if (action.prompt) {
      const value = window.prompt(action.prompt.label, action.prompt.defaultValue || "");
      if (value === null) return;
      payload = { ...payload, [action.prompt.key]: value };
    }
    setSaving(true);
    try {
      const response = await api.request({
        method: action.method || "post",
        url: typeof action.endpoint === "function" ? action.endpoint(row) : action.endpoint,
        data: payload,
      });
      showToast({
        type: "success",
        message: response.data?.message || action.successMessage || `${action.label} completed successfully.`,
      });
      loadRows();
    } catch (error) {
      showToast({ type: "error", message: errorMessage(error), duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const common = {
      label: field.label,
      value: form[field.key] ?? "",
      required: field.required,
      fullWidth: true,
      disabled: field.readOnly,
      onChange: (event) =>
        setForm((current) => ({ ...current, [field.key]: event.target.value })),
    };
    if (field.type === "select") {
      return (
        <SelectField
          {...common}
          searchable
          multiple={field.multiple}
          options={field.options || lookups[field.key] || []}
        />
      );
    }
    if (field.type === "toggle") {
      return (
        <div className="flex min-h-12 items-center justify-between rounded-lg border border-slate-200 px-3 dark:border-slate-700">
          <span className="text-sm text-slate-700 dark:text-slate-200">{field.label}</span>
          <ToggleSwitch
            checked={Boolean(form[field.key])}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                [field.key]: value?.target ? value.target.checked : value,
              }))
            }
          />
        </div>
      );
    }
    if (field.type === "textarea") return <TextAreaField {...common} />;
    if (field.type === "number") {
      return <NumberField {...common} min={field.min} max={field.max} step={field.step} />;
    }
    return <TextField {...common} type={field.type || "text"} />;
  };

  const viewValue = (field) => {
    const value = viewing?.[field.key];
    if (value === null || value === undefined || value === "") return "—";
    if (field.type === "toggle") return value ? "Yes" : "No";
    if (field.type === "select") {
      return (
        (field.options || lookups[field.key] || []).find(
          (option) => String(option.value) === String(value),
        )?.label || String(value)
      );
    }
    return String(value);
  };

  const displayRows = rows.map((row) => {
    const display = { ...row };
    columns.forEach((column) => {
      const value = row[column.key];
      if (column.render) display[column.key] = column.render(value, row);
      else if (typeof value === "boolean" || value === 0 || value === 1) {
        if (column.boolean) display[column.key] = value ? "Yes" : "No";
      } else if (value === null || value === undefined || value === "") {
        display[column.key] = "—";
      }
    });
    return display;
  });

  const filterFields = config.fields.filter((field) => field.filterable);

  return (
    <div className="space-y-5">
      <ToastContainer />
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-300">{config.section}</p>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{config.title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{config.description}</p>
        </div>
        {!config.readOnly && <Button onClick={openCreate}>Add {config.singular}</Button>}
      </header>

      {filterFields.length > 0 && (
        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111318] md:grid-cols-3 xl:grid-cols-5">
          {filterFields.map((field) =>
            field.type === "select" ? (
              <SelectField
                key={field.key}
                label={field.label}
                value={filters[field.key] ?? ""}
                options={[{ value: "", label: "All" }, ...(field.options || lookups[field.key] || [])]}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, [field.key]: event.target.value }));
                }}
                fullWidth
              />
            ) : (
              <TextField
                key={field.key}
                label={field.label}
                value={filters[field.key] ?? ""}
                onChange={(event) => {
                  setPage(1);
                  setFilters((current) => ({ ...current, [field.key]: event.target.value }));
                }}
                fullWidth
              />
            ),
          )}
          <Button variant="secondary" onClick={() => setFilters({})}>Clear filters</Button>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111318]">
        <Table
          columns={columns}
          data={displayRows}
          searchable
          serverSide
          loading={loading}
          totalRows={total}
          currentPage={page}
          defaultRowsPerPage={perPage}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onSortChange={(key, direction) => setSort({ key, direction })}
          actions={(config.readOnly && !config.rowActions?.length)
            ? null
            : (row) => [
                  ...(config.rowActions || [])
                    .filter((action) => !action.when || action.when(rows.find((item) => item.id === row.id) || row))
                    .map((action) => ({
                      label: action.label,
                      icon: <span className="text-sm font-semibold text-emerald-600">{action.label}</span>,
                      onClick: () => runRowAction(action, rows.find((item) => item.id === row.id) || row),
                    })),
                  ...(config.viewable ? [
                  {
                    label: "View",
                    icon: (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ),
                    onClick: () => openView(rows.find((item) => item.id === row.id) || row),
                  },
                  ] : []),
                  ...(!config.readOnly ? [
                  {
                    label: "Edit",
                    icon: (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    ),
                    onClick: () => openEdit(rows.find((item) => item.id === row.id) || row),
                  },
                  {
                    label: "Delete",
                    icon: (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ),
                    onClick: () => setConfirmDelete(row),
                  },
                  ] : []),
                ]}
          actionsAlign="right"
        />
      </section>

      <Dialog
        isOpen={Object.keys(form).length > 0}
        onClose={closeForm}
        title={`${editing ? "Edit" : "Add"} ${config.singular}`}
        size={config.dialogSize || "large"}
        onPrimaryButtonClick={save}
        primaryButtonText={editing ? "Save changes" : "Create"}
        primaryButtonDisabled={saving}
        secondaryButtonDisabled={saving}
      >
        <div className="grid gap-4 py-2 md:grid-cols-2">
          {config.fields.map((field) => (
            <div key={field.key} className={field.fullRow ? "md:col-span-2" : ""}>
              {renderField(field)}
            </div>
          ))}
        </div>
      </Dialog>

      <Dialog
        isOpen={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={`${config.singular} Details`}
        size={config.viewDialogSize || "medium"}
        showPrimaryButton={false}
        secondaryButtonText="Close"
      >
        {viewLoading ? (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading details...
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <dl className="grid gap-4 sm:grid-cols-2">
              {(config.viewFields || config.fields)
                .filter((field) => field.key !== "permission_ids")
                .filter(
                  (field) =>
                    !config.hideEmptyViewFields ||
                    (viewing?.[field.key] !== null &&
                      viewing?.[field.key] !== undefined &&
                      viewing?.[field.key] !== ""),
                )
                .map((field) => (
                  <div key={field.key} className={field.fullRow ? "sm:col-span-2" : ""}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {field.label}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">
                      {viewValue(field)}
                    </dd>
                  </div>
                ))}
            </dl>

            {config.viewPermissions && (
              <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Permissions
              </h3>
              {viewing?.permissions?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {viewing.permissions.map((permission) => (
                    <span
                      key={permission.id}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                    >
                      {permission.display_name || permission.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  No permissions assigned.
                </p>
              )}
              </div>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={`Delete ${config.singular}`}
        size="small"
        onPrimaryButtonClick={remove}
        primaryButtonText="Delete"
        primaryButtonDisabled={saving}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This action may be blocked when the record is already used by another module.
        </p>
      </Dialog>
    </div>
  );
};
