import { useEffect, useState } from "react";
import { ActionMenu } from "../../components/ActionMenu";
import { Button, CheckboxField, NumberField, SelectField, TextAreaField, TextField } from "../../components/DataFields";
import { Dialog } from "../../components/Popups";
import { Table } from "../../components/Tables";
import api from "../../axiosClient";

const emptyForm = { name: "", code: "", description: "", image_path: "", display_order: "0", is_active: true, branch_ids: [] };

export const MenuCategories = () => {
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadData = async () => {
    const [categoryResponse, branchResponse] = await Promise.all([api.get("/menu-categories"), api.get("/branches")]);
    setCategories(categoryResponse.data.data);
    setBranches(branchResponse.data.data.data.map((branch) => ({ value: String(branch.id), label: branch.name })));
  };

  useEffect(() => {
    loadData().catch((error) => console.error("Unable to load menu categories", error));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setIsOpen(true);
  };

  const openEdit = async (row) => {
    try {
      const { data } = await api.get(`/menu-categories/${row.id}`);
      const category = data.data;
      setEditingId(category.id);
      setForm({
        name: category.name ?? "",
        code: category.code ?? "",
        description: category.description ?? "",
        image_path: category.image_path ?? "",
        display_order: String(category.display_order ?? 0),
        is_active: Boolean(category.is_active),
        branch_ids: (category.branches ?? []).map((branch) => String(branch.id)),
      });
      setErrors({});
      setIsOpen(true);
    } catch (error) {
      console.error("Unable to load category", error);
    }
  };

  const save = async () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.code.trim()) nextErrors.code = "Code is required.";
    if (!form.branch_ids.length) nextErrors.branch_ids = "Assign the category to at least one branch.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      display_order: Number(form.display_order || 0),
      branch_ids: form.branch_ids.map(Number),
    };
    setIsSubmitting(true);
    try {
      if (editingId) await api.put(`/menu-categories/${editingId}`, payload);
      else await api.post("/menu-categories", payload);
      await loadData();
      setIsOpen(false);
    } catch (error) {
      const responseErrors = error.response?.data?.errors ?? {};
      setErrors(Object.fromEntries(Object.entries(responseErrors).map(([key, messages]) => [key, messages?.[0] ?? "Invalid value."])));
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.name}?`)) return;
    await api.delete(`/menu-categories/${row.id}`);
    await loadData();
  };

  const rows = categories.map((category) => ({
    ...category,
    branches_label: (category.branches ?? []).map((branch) => branch.name).join(", ") || "—",
    active_label: category.is_active ? "Active" : "Inactive",
  }));
  const columns = [
    { key: "code", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "branches_label", label: "Branches" },
    { key: "display_order", label: "Display order", sortable: true },
    { key: "active_label", label: "Status" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-950 dark:text-[#F7F8F8]">Menu Categories</h1>
          <p className="text-sm text-slate-500 dark:text-[#8A8F98]">Manage categories assigned to branches and menu items.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>Add Category</Button>
      </div>
      <Table
        columns={columns}
        data={rows}
        selectable={false}
        expandable={false}
        searchable
        filterable={false}
        pagination
        actions={(row) => [{
          label: "Category actions",
          render: () => <ActionMenu label={`Actions for ${row.name}`} items={[
            { label: "Edit category", onClick: () => openEdit(row) },
            { label: "Delete category", variant: "danger", onClick: () => remove(row) },
          ]} />,
        }]}
      />
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingId ? "Edit Category" : "Add Category"}
        size="medium"
        primaryButtonText={isSubmitting ? "Saving..." : editingId ? "Update" : "Save"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isSubmitting}
        secondaryButtonDisabled={isSubmitting}
        onPrimaryButtonClick={save}
        onSecondaryButtonClick={() => setIsOpen(false)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} error={!!errors.name} helperText={errors.name} />
          <TextField label="Code" required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} error={!!errors.code} helperText={errors.code} />
          <TextField label="Image path" value={form.image_path} onChange={(event) => setForm({ ...form, image_path: event.target.value })} />
          <NumberField label="Display order" min={0} value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} />
          <SelectField label="Branches" required fullWidth multiple searchable value={form.branch_ids} options={branches} onChange={(event) => setForm({ ...form, branch_ids: event.target.value })} error={!!errors.branch_ids} helperText={errors.branch_ids} />
          <CheckboxField label="Active" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
          <TextAreaField label="Description" fullWidth rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>
      </Dialog>
    </div>
  );
};

export default MenuCategories;
