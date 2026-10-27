import { useEffect, useState } from "react";
import { ActionMenu } from "../../components/ActionMenu";
import { Button, CheckboxField, NumberField, SelectField, TextField } from "../../components/DataFields";
import { Dialog } from "../../components/Popups";
import { Table } from "../../components/Tables";
import api from "../../axiosClient";

const blank = { name: "", symbol: "", unit_type: "mass", base_unit_id: "", conversion_factor: "1", is_active: true };

export const Units = () => {
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async () => setUnits((await api.get("/units")).data.data);
  useEffect(() => { load().catch((reason) => console.error("Unable to load units", reason)); }, []);

  const edit = async (row) => {
    const { data } = await api.get(`/units/${row.id}`);
    const unit = data.data;
    setEditingId(unit.id);
    setForm({ name: unit.name, symbol: unit.symbol, unit_type: unit.unit_type, base_unit_id: unit.base_unit_id ? String(unit.base_unit_id) : "", conversion_factor: String(unit.conversion_factor), is_active: Boolean(unit.is_active) });
    setError("");
    setOpen(true);
  };
  const save = async () => {
    setBusy(true);
    setError("");
    const payload = { ...form, base_unit_id: form.base_unit_id ? Number(form.base_unit_id) : null, conversion_factor: Number(form.conversion_factor) };
    try {
      if (editingId) await api.put(`/units/${editingId}`, payload);
      else await api.post("/units", payload);
      await load();
      setOpen(false);
    } catch (reason) {
      setError(reason.response?.data?.errors?.base_unit_id?.[0] ?? reason.response?.data?.errors?.symbol?.[0] ?? reason.response?.data?.message ?? "Unable to save unit.");
    } finally { setBusy(false); }
  };
  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.name}?`)) return;
    try { await api.delete(`/units/${row.id}`); await load(); }
    catch (reason) { window.alert(reason.response?.data?.errors?.unit?.[0] ?? "This unit is in use."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold text-slate-950 dark:text-[#F7F8F8]">Units</h1><p className="text-sm text-slate-500 dark:text-[#8A8F98]">Shared measurement units and compatible conversions.</p></div><Button variant="primary" onClick={() => { setEditingId(null); setForm(blank); setError(""); setOpen(true); }}>Add Unit</Button></div>
      <Table columns={[{ key: "name", label: "Name" }, { key: "symbol", label: "Symbol" }, { key: "unit_type", label: "Type" }, { key: "base_unit_name", label: "Conversion base" }, { key: "conversion_factor", label: "Factor" }, { key: "active_label", label: "Status" }]} data={units.map((unit) => ({ ...unit, base_unit_name: unit.base_unit?.name ?? "Base unit", active_label: unit.is_active ? "Active" : "Inactive" }))} selectable={false} expandable={false} searchable pagination filterable={false} actions={(row) => [{ label: "Unit actions", render: () => <ActionMenu label={`Actions for ${row.name}`} items={[{ label: "Edit", onClick: () => edit(row) }, { label: "Delete", variant: "danger", onClick: () => remove(row) }]} /> }]} />
      <Dialog isOpen={open} onClose={() => setOpen(false)} title={editingId ? "Edit Unit" : "Add Unit"} size="medium" primaryButtonText={busy ? "Saving..." : "Save"} secondaryButtonText="Cancel" primaryButtonDisabled={busy} onPrimaryButtonClick={save} onSecondaryButtonClick={() => setOpen(false)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <TextField label="Symbol" required value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value })} />
          <SelectField label="Unit type" required fullWidth value={form.unit_type} options={[{ value: "mass", label: "Mass" }, { value: "volume", label: "Volume" }, { value: "count", label: "Count" }]} onChange={(event) => setForm({ ...form, unit_type: event.target.value, base_unit_id: "" })} />
          <SelectField label="Conversion base" fullWidth value={form.base_unit_id} options={units.filter((unit) => unit.unit_type === form.unit_type && unit.id !== editingId).map((unit) => ({ value: String(unit.id), label: `${unit.name} (${unit.symbol})` }))} onChange={(event) => setForm({ ...form, base_unit_id: event.target.value })} />
          <NumberField label="Conversion factor" min={0.000001} step={0.000001} value={form.conversion_factor} onChange={(event) => setForm({ ...form, conversion_factor: event.target.value })} />
          <CheckboxField label="Active" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        </div>
      </Dialog>
    </div>
  );
};

export default Units;
