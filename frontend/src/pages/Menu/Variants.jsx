import { useEffect, useState } from "react";
import { ActionMenu } from "../../components/ActionMenu";
import {
  Button,
  NumberField,
  SelectField,
  TextField,
} from "../../components/DataFields";
import { Dialog } from "../../components/Popups";
import { Table } from "../../components/Tables";
import { Chip } from "../../components/Chip";
import { OrderedRowBuilder } from "../../components/OrderedRowBuilder";
import api from "../../axiosClient";

const initialForm = () => ({
  name: "",
  code: "",
  selection_type: "single",
  min_select: "",
  max_select: "",
  is_active: true,
  options: [],
});

export const Variants = () => {
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      setVariants((await api.get("/variants")).data.data);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    load().catch(console.error);
  }, []);
  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm());
    setIsOpen(true);
  };
  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      code: row.code,
      selection_type: row.selection_type,
      min_select: String(row.min_select ?? ""),
      max_select: String(row.max_select ?? ""),
      is_active: Boolean(row.is_active),
      options: row.options.map((option) => ({
        ...option,
        default_additional_price: String(option.default_additional_price),
      })),
    });
    setIsOpen(true);
  };
  const save = async () => {
    setSaving(true);
    const isSingle = form.selection_type === "single";
    const payload = {
      ...form,
      min_select: isSingle ? 1 : Number(form.min_select || 0),
      max_select: isSingle
        ? 1
        : form.max_select === ""
          ? form.options.length
          : Number(form.max_select),
      options: form.options.map((option, index) => {
        const { id, ...optionData } = option;
        const persistedId =
          id !== undefined && id !== null && Number.isInteger(Number(id))
            ? Number(id)
            : undefined;

        return {
          ...optionData,
          ...(persistedId !== undefined ? { id: persistedId } : {}),
          code: option.code.trim().toUpperCase(),
          default_additional_price: Number(
            option.default_additional_price || 0,
          ),
          is_active: option.is_active !== "false",
          display_order: index,
        };
      }),
    };
    try {
      if (editingId) await api.put(`/variants/${editingId}`, payload);
      else await api.post("/variants", payload);
      await load();
      setIsOpen(false);
    } catch (error) {
      window.alert(
        Object.values(error.response?.data?.errors ?? {})
          .flat()
          .join("\n") || "Unable to save variant.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = (row) => {
    setDeleteError("");
    setVariantToDelete(row);
  };
  const confirmDelete = async () => {
    if (!variantToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/variants/${variantToDelete.id}`);
      await load();
      setVariantToDelete(null);
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Unable to delete this variant. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
  const rows = variants.map((variant) => ({
    ...variant,
    option_names: variant.options.map((option) => option.name).join(", "),
    active_label: <Chip status={variant.is_active ? "Active" : "Inactive"} size="small" />,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Variants</h1>
          <p className="text-sm text-slate-500">
            Create reusable option groups such as portion size and add-ons.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Add Variant
        </Button>
      </div>
      <Table
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "code", label: "Code" },
          { key: "selection_type", label: "Selection" },
          { key: "option_names", label: "Options" },
          { key: "active_label", label: "Active" },
        ]}
        data={rows}
        loading={isLoading}
        searchable
        pagination
        selectable={false}
        expandable={false}
        actions={(row) => [
          {
            label: "Actions",
            render: () => (
              <ActionMenu
                label={`Actions for ${row.name}`}
                items={[
                  { label: "Edit", onClick: () => openEdit(row) },
                  {
                    label: "Delete",
                    variant: "danger",
                    onClick: () => remove(row),
                  },
                ]}
              />
            ),
          },
        ]}
      />
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingId ? "Edit Variant" : "Add Variant"}
        size="large"
        primaryButtonText={saving ? "Saving..." : "Save"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={saving}
        onPrimaryButtonClick={save}
        onSecondaryButtonClick={() => setIsOpen(false)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <TextField
            label="Code"
            required
            value={form.code}
            onChange={(event) =>
              setForm({ ...form, code: event.target.value.toUpperCase() })
            }
          />
          <SelectField
            label="Selection type"
            value={form.selection_type}
            options={[
              { value: "single", label: "Single" },
              { value: "multiple", label: "Multiple" },
            ]}
            onChange={(event) =>
              setForm({
                ...form,
                selection_type: event.target.value,
                min_select: event.target.value === "single" ? "1" : "",
                max_select: event.target.value === "single" ? "1" : "",
              })
            }
          />
          {form.selection_type === "multiple" && (
            <>
              <NumberField
                label="Minimum selections (optional)"
                min={0}
                value={form.min_select}
                onChange={(event) =>
                  setForm({ ...form, min_select: event.target.value })
                }
              />
              <NumberField
                label="Maximum selections (optional)"
                min={1}
                value={form.max_select}
                onChange={(event) =>
                  setForm({ ...form, max_select: event.target.value })
                }
              />
            </>
          )}
          <SelectField
            label="Status"
            value={form.is_active ? "active" : "inactive"}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            onChange={(event) =>
              setForm({ ...form, is_active: event.target.value === "active" })
            }
          />
          <div className="space-y-3 sm:col-span-2">
            <OrderedRowBuilder
              key={`${editingId ?? "new"}-${isOpen}`}
              title="Add option details"
              addLabel="Add option"
              emptyMessage="No options added yet."
              value={form.options}
              onChange={(options) =>
                setForm((current) => ({ ...current, options }))
              }
              fields={[
                {
                  key: "name",
                  label: "Option name",
                  required: true,
                },
                {
                  key: "code",
                  label: "Code",
                  required: true,
                },
                {
                  key: "default_additional_price",
                  label: "Default add-on price",
                  type: "number",
                  min: "0",
                  step: "0.01",
                },
                {
                  key: "is_active",
                  label: "Status",
                  required: true,
                  defaultValue: "true",
                  placeholder: false,
                  options: [
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ],
                },
              ]}
            />
          </div>
        </div>
      </Dialog>
      <Dialog
        isOpen={!!variantToDelete}
        onClose={() => !isDeleting && setVariantToDelete(null)}
        title="Delete variant?"
        size="small"
        primaryButtonText={isDeleting ? "Deleting..." : "Delete"}
        primaryButtonDisabled={isDeleting}
        secondaryButtonText="Cancel"
        secondaryButtonDisabled={isDeleting}
        onPrimaryButtonClick={confirmDelete}
        onSecondaryButtonClick={() => setVariantToDelete(null)}
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-[#B7BBC3]">
          <p>
            Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-[#F7F8F8]">{variantToDelete?.name}</span> and its options? This action cannot be undone.
          </p>
          {deleteError && <p role="alert" className="text-red-600 dark:text-red-400">{deleteError}</p>}
        </div>
      </Dialog>
    </div>
  );
};

export default Variants;
