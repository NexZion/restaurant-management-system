import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../axiosClient";
import { Button, NumberField, SelectField, TextAreaField } from "../../components/DataFields";
import { Dialog, useToast } from "../../components/Popups";
import { Table } from "../../components/Tables";

const messageOf = (error) =>
  Object.values(error?.response?.data?.errors || {}).flat().join(" ") ||
  error?.response?.data?.message ||
  "The shift operation failed.";

export const CashierShifts = () => {
  const { showToast, ToastContainer } = useToast();
  const toastRef = useRef(showToast);
  useEffect(() => {
    toastRef.current = showToast;
  }, [showToast]);
  const [rows, setRows] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ pos_terminal_id: "", opening_cash: "", closing_cash: "", notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [shiftResponse, terminalResponse] = await Promise.all([
        api.get("/cashier-shifts", { params: { per_page: 100, sort_by: "id", sort_direction: "desc" } }),
        api.get("/pos-terminals", { params: { per_page: 100, "filters[is_active]": 1 } }),
      ]);
      setRows(shiftResponse.data?.data?.data || shiftResponse.data?.data || []);
      const terminalRows = terminalResponse.data?.data?.data || terminalResponse.data?.data || [];
      setTerminals(terminalRows.map((item) => ({ value: item.id, label: item.name || item.code || `Terminal #${item.id}` })));
    } catch (error) {
      toastRef.current({ type: "error", message: messageOf(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const submit = async () => {
    try {
      if (dialog?.mode === "open") {
        await api.post("/cashier-shifts/open", {
          pos_terminal_id: Number(form.pos_terminal_id),
          opening_cash: Number(form.opening_cash),
          notes: form.notes || null,
        });
      } else {
        await api.post(`/cashier-shifts/${dialog.id}/close`, {
          closing_cash: Number(form.closing_cash),
          notes: form.notes || null,
        });
      }
      showToast({ type: "success", message: `Shift ${dialog?.mode === "open" ? "opened" : "closed"} successfully.` });
      setDialog(null);
      load();
    } catch (error) {
      showToast({ type: "error", message: messageOf(error) });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <ToastContainer />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Point of Sale</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cashier Shifts</h1>
          <p className="text-sm text-slate-500">Open a terminal float and reconcile cash when the shift closes.</p>
        </div>
        <Button onClick={() => { setForm({ pos_terminal_id: "", opening_cash: "", closing_cash: "", notes: "" }); setDialog({ mode: "open" }); }}>
          Open Shift
        </Button>
      </div>
      <Table
        columns={[
          { key: "id", label: "ID" }, { key: "pos_terminal_id", label: "Terminal" },
          { key: "user_id", label: "Cashier" }, { key: "opening_cash", label: "Opening Cash" },
          { key: "closing_cash", label: "Closing Cash" }, { key: "status", label: "Status" },
          { key: "opened_at", label: "Opened" }, { key: "closed_at", label: "Closed" },
        ]}
        data={rows}
        loading={loading}
        actions={(row) => row.status === "open" ? [{ label: "Close Shift", onClick: () => { setForm((current) => ({ ...current, closing_cash: "", notes: "" })); setDialog({ mode: "close", id: row.id }); } }] : []}
      />
      <Dialog
        isOpen={Boolean(dialog)}
        onClose={() => setDialog(null)}
        title={dialog?.mode === "open" ? "Open cashier shift" : "Close cashier shift"}
        footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={submit}>{dialog?.mode === "open" ? "Open Shift" : "Close Shift"}</Button></>}
      >
        <div className="space-y-4">
          {dialog?.mode === "open" ? (
            <>
              <SelectField label="POS Terminal" value={form.pos_terminal_id} options={terminals} onChange={(event) => setForm({ ...form, pos_terminal_id: event.target.value })} required />
              <NumberField label="Opening Cash" value={form.opening_cash} min={0} onChange={(event) => setForm({ ...form, opening_cash: event.target.value })} required />
            </>
          ) : (
            <NumberField label="Closing Cash" value={form.closing_cash} min={0} onChange={(event) => setForm({ ...form, closing_cash: event.target.value })} required />
          )}
          <TextAreaField label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
      </Dialog>
    </div>
  );
};
