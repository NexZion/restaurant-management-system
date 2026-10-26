import { useEffect, useState } from "react";
import { ActionMenu } from "../../components/ActionMenu";
import { Button, CheckboxField, NumberField, SelectField, TextAreaField, TextField } from "../../components/DataFields";
import { Dialog } from "../../components/Popups";
import { Table } from "../../components/Tables";
import api from "../../axiosClient";

const blank = { name: "", sku: "", description: "", base_unit_id: "", default_unit_cost: "0", is_active: true, branch_assignments: [] };

export const RawMaterials = () => {
  const [rows, setRows] = useState([]);
  const [units, setUnits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const load = async () => {
    const [materialsResponse, unitsResponse, branchesResponse] = await Promise.all([
      api.get("/raw-materials"), api.get("/units"), api.get("/branches"),
    ]);
    setRows(materialsResponse.data.data);
    setUnits(unitsResponse.data.data.filter((unit) => unit.is_active));
    setBranches(branchesResponse.data.data.data.map((branch) => ({ value: String(branch.id), label: branch.name })));
  };
  useEffect(() => { load().catch((error) => console.error("Unable to load raw materials", error)); }, []);

  const startEdit = async (row) => {
    const { data } = await api.get(`/raw-materials/${row.id}`);
    const material = data.data;
    setEditingId(material.id);
    setForm({
      name: material.name,
      sku: material.sku,
      description: material.description ?? "",
      base_unit_id: String(material.base_unit_id),
      default_unit_cost: String(material.default_unit_cost),
      is_active: Boolean(material.is_active),
      branch_assignments: material.branches.map((branch) => ({
        branch_id: String(branch.id),
        unit_cost: branch.pivot.unit_cost == null ? "" : String(branch.pivot.unit_cost),
        is_active: Boolean(branch.pivot.is_active),
      })),
    });
    setErrors({});
    setOpen(true);
  };

  const setBranchesForMaterial = (ids) => setForm((current) => ({
    ...current,
    branch_assignments: ids.map((id) => current.branch_assignments.find((assignment) => assignment.branch_id === id) ?? ({ branch_id: id, unit_cost: "", is_active: true })),
  }));

  const updateBranch = (id, key, value) => setForm((current) => ({
    ...current,
    branch_assignments: current.branch_assignments.map((assignment) => assignment.branch_id === id ? { ...assignment, [key]: value } : assignment),
  }));

  const save = async () => {
    const payload = {
      ...form,
      base_unit_id: Number(form.base_unit_id),
      default_unit_cost: Number(form.default_unit_cost || 0),
      branch_assignments: form.branch_assignments.map((assignment) => ({
        ...assignment,
        branch_id: Number(assignment.branch_id),
        unit_cost: assignment.unit_cost === "" ? null : Number(assignment.unit_cost),
      })),
    };
    setBusy(true);
    try {
      if (editingId) await api.put(`/raw-materials/${editingId}`, payload);
      else await api.post("/raw-materials", payload);
      await load();
      setOpen(false);
    } catch (error) {
      const responseErrors = error.response?.data?.errors ?? {};
      setErrors(Object.fromEntries(Object.entries(responseErrors).map(([key, messages]) => [key, messages?.[0] ?? "Invalid value."])));
    } finally { setBusy(false); }
  };
  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.name}?`)) return;
    await api.delete(`/raw-materials/${row.id}`);
    await load();
  };

  const tableRows = rows.map((row) => ({
    ...row,
    unit: row.base_unit?.symbol ?? "—",
    branches_label: row.branches?.map((branch) => branch.name).join(", ") || "—",
  }));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-slate-950 dark:text-[#F7F8F8]">Raw Materials</h1><p className="text-sm text-slate-500 dark:text-[#8A8F98]">Manage shared ingredients and branch-specific costs.</p></div>
        <Button variant="primary" onClick={() => { setEditingId(null); setForm(blank); setErrors({}); setOpen(true); }}>Add Raw Material</Button>
      </div>
      <Table columns={[{ key: "sku", label: "SKU" }, { key: "name", label: "Name" }, { key: "unit", label: "Base unit" }, { key: "default_unit_cost", label: "Default cost" }, { key: "branches_label", label: "Branches" }]} data={tableRows} selectable={false} expandable={false} searchable pagination filterable={false} actions={(row) => [{ label: "Material actions", render: () => <ActionMenu label={`Actions for ${row.name}`} items={[{ label: "Edit", onClick: () => startEdit(row) }, { label: "Delete", variant: "danger", onClick: () => remove(row) }]} /> }]} />
      <Dialog isOpen={open} onClose={() => setOpen(false)} title={editingId ? "Edit Raw Material" : "Add Raw Material"} size="large" primaryButtonText={busy ? "Saving..." : "Save"} secondaryButtonText="Cancel" primaryButtonDisabled={busy} onPrimaryButtonClick={save} onSecondaryButtonClick={() => setOpen(false)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <TextField label="SKU" required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value.toUpperCase() })} helperText={errors.sku} error={!!errors.sku} />
          <SelectField label="Base unit" required fullWidth value={form.base_unit_id} options={units.map((unit) => ({ value: String(unit.id), label: `${unit.name} (${unit.symbol})` }))} onChange={(event) => setForm({ ...form, base_unit_id: event.target.value })} helperText={errors.base_unit_id} error={!!errors.base_unit_id} />
          <NumberField label="Default unit cost" min={0} step={0.0001} value={form.default_unit_cost} onChange={(event) => setForm({ ...form, default_unit_cost: event.target.value })} />
          <SelectField label="Branches" required fullWidth multiple searchable value={form.branch_assignments.map((assignment) => assignment.branch_id)} options={branches} onChange={(event) => setBranchesForMaterial(event.target.value)} helperText={errors.branch_assignments || "Select branches where this ingredient is used."} error={!!errors.branch_assignments} />
          <CheckboxField label="Active" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
          <TextAreaField label="Description" fullWidth rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          {form.branch_assignments.map((assignment) => <div key={assignment.branch_id} className="grid gap-3 rounded border border-slate-200 p-3 dark:border-[#1F2226] sm:col-span-2 sm:grid-cols-2"><strong className="sm:col-span-2">{branches.find((branch) => branch.value === assignment.branch_id)?.label}</strong><NumberField label="Branch unit cost (blank uses default)" min={0} step={0.0001} value={assignment.unit_cost} onChange={(event) => updateBranch(assignment.branch_id, "unit_cost", event.target.value)} /><CheckboxField label="Active at branch" checked={assignment.is_active} onChange={(event) => updateBranch(assignment.branch_id, "is_active", event.target.checked)} /></div>)}
        </div>
      </Dialog>
    </div>
  );
};

export default RawMaterials;
