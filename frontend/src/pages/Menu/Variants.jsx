import { useEffect, useState } from "react";
import { ActionMenu } from "../../components/ActionMenu";
import { Button, CheckboxField, NumberField, SelectField, TextField } from "../../components/DataFields";
import { Dialog } from "../../components/Popups";
import { Table } from "../../components/Tables";
import api from "../../axiosClient";

const newOption = () => ({ name: "", code: "", default_additional_price: "0", is_active: true, display_order: "0" });
const initialForm = () => ({ name: "", code: "", selection_type: "single", min_select: "1", max_select: "1", is_active: true, options: [newOption()] });

export const Variants = () => {
  const [variants, setVariants] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => setVariants((await api.get("/variants")).data.data);
  useEffect(() => { load().catch(console.error); }, []);
  const openCreate = () => { setEditingId(null); setForm(initialForm()); setIsOpen(true); };
  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ name: row.name, code: row.code, selection_type: row.selection_type, min_select: String(row.min_select), max_select: String(row.max_select), is_active: Boolean(row.is_active), options: row.options.map((option) => ({ ...option, id: option.id, default_additional_price: String(option.default_additional_price), display_order: String(option.display_order) })) });
    setIsOpen(true);
  };
  const updateOption = (index, key, value) => setForm((current) => ({ ...current, options: current.options.map((option, i) => i === index ? { ...option, [key]: value } : option) }));
  const save = async () => {
    setSaving(true);
    const payload = { ...form, min_select: Number(form.min_select), max_select: Number(form.max_select), options: form.options.map((option, index) => ({ ...option, code: option.code.trim().toUpperCase(), default_additional_price: Number(option.default_additional_price || 0), display_order: Number(option.display_order || index) })) };
    try {
      if (editingId) await api.put(`/variants/${editingId}`, payload); else await api.post("/variants", payload);
      await load(); setIsOpen(false);
    } catch (error) {
      window.alert(Object.values(error.response?.data?.errors ?? {}).flat().join("\n") || "Unable to save variant.");
    } finally { setSaving(false); }
  };
  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.name} and its option assignments?`)) return;
    await api.delete(`/variants/${row.id}`); await load();
  };
  const rows = variants.map((variant) => ({ ...variant, option_names: variant.options.map((option) => option.name).join(", "), active_label: variant.is_active ? "Active" : "Inactive" }));

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Variants</h1><p className="text-sm text-slate-500">Create reusable option groups such as portion size and add-ons.</p></div><Button variant="primary" onClick={openCreate}>Add Variant</Button></div>
    <Table columns={[{ key: "name", label: "Name", sortable: true }, { key: "code", label: "Code" }, { key: "selection_type", label: "Selection" }, { key: "option_names", label: "Options" }, { key: "active_label", label: "Active" }]} data={rows} searchable pagination selectable={false} expandable={false} actions={(row) => [{ label: "Actions", render: () => <ActionMenu label={`Actions for ${row.name}`} items={[{ label: "Edit", onClick: () => openEdit(row) }, { label: "Delete", variant: "danger", onClick: () => remove(row) }]} /> }]} />
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingId ? "Edit Variant" : "Add Variant"} size="large" primaryButtonText={saving ? "Saving..." : "Save"} secondaryButtonText="Cancel" primaryButtonDisabled={saving} onPrimaryButtonClick={save} onSecondaryButtonClick={() => setIsOpen(false)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <TextField label="Code" required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} />
        <SelectField label="Selection type" value={form.selection_type} options={[{ value: "single", label: "Single" }, { value: "multiple", label: "Multiple" }]} onChange={(event) => setForm({ ...form, selection_type: event.target.value, max_select: event.target.value === "single" ? "1" : form.max_select })} />
        <NumberField label="Minimum selections" min={0} value={form.min_select} onChange={(event) => setForm({ ...form, min_select: event.target.value })} />
        <NumberField label="Maximum selections" min={1} value={form.max_select} onChange={(event) => setForm({ ...form, max_select: event.target.value })} />
        <CheckboxField label="Active" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
        <div className="space-y-3 sm:col-span-2"><div className="flex items-center justify-between"><h3 className="font-semibold">Options</h3><Button variant="secondary" onClick={() => setForm({ ...form, options: [...form.options, newOption()] })}>Add option</Button></div>
          {form.options.map((option, index) => <div key={option.id ?? index} className="grid gap-3 rounded-lg border border-slate-200 p-3 dark:border-[#30343A] sm:grid-cols-2">
            <TextField label="Option name" required value={option.name} onChange={(event) => updateOption(index, "name", event.target.value)} />
            <TextField label="Code" required value={option.code} onChange={(event) => updateOption(index, "code", event.target.value.toUpperCase())} />
            <NumberField label="Default add-on price" min={0} step={0.01} value={option.default_additional_price} onChange={(event) => updateOption(index, "default_additional_price", event.target.value)} />
            <NumberField label="Display order" min={0} value={option.display_order} onChange={(event) => updateOption(index, "display_order", event.target.value)} />
            <CheckboxField label="Active" checked={Boolean(option.is_active)} onChange={(event) => updateOption(index, "is_active", event.target.checked)} />
            {form.options.length > 1 && <Button variant="outlined" onClick={() => setForm({ ...form, options: form.options.filter((_, i) => i !== index) })}>Remove option</Button>}
          </div>)}
        </div>
      </div>
    </Dialog>
  </div>;
};

export default Variants;
