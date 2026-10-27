import { useEffect, useState } from "react";
import { ActionMenu } from "../../components/ActionMenu";
import {
  Button,
  CheckboxField,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "../../components/DataFields";
import { Dialog } from "../../components/Popups";
import { Table } from "../../components/Tables";
import api from "../../axiosClient";

const emptyForm = {
  name: "",
  sku: "",
  menu_category_id: "",
  description: "",
  base_price: "0",
  base_cost: "0",
  image_path: "",
  image_file: null,
  preparation_time: "",
  display_order: "0",
  is_active: true,
  is_available: true,
  branch_assignments: [],
  variant_option_assignments: [],
};

export const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [variantGroups, setVariantGroups] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadData = async () => {
    const [itemResponse, categoryResponse, branchResponse, variantResponse] =
      await Promise.all([
        api.get("/menu-items"),
        api.get("/menu-categories"),
        api.get("/branches"),
        api.get("/variants"),
      ]);
    setItems(itemResponse.data.data);
    setCategories(
      categoryResponse.data.data.filter((category) => category.is_active),
    );
    setBranches(
      branchResponse.data.data.data.map((branch) => ({
        value: String(branch.id),
        label: branch.name,
      })),
    );
    setVariantGroups(
      variantResponse.data.data.filter((variant) => variant.is_active),
    );
  };

  useEffect(() => {
    loadData().catch((error) =>
      console.error("Unable to load menu items", error),
    );
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setIsOpen(true);
  };

  const openEdit = async (row) => {
    try {
      const { data } = await api.get(`/menu-items/${row.id}`);
      const item = data.data;
      setEditingId(item.id);
      setForm({
        name: item.name ?? "",
        sku: item.sku ?? "",
        menu_category_id: String(item.menu_category_id ?? ""),
        description: item.description ?? "",
        base_price: String(item.base_price ?? 0),
        base_cost: String(item.base_cost ?? 0),
        image_path:
          item.images?.find((image) => image.is_primary)?.image_path ??
          item.images?.[0]?.image_path ??
          "",
        image_file: null,
        preparation_time:
          item.preparation_time == null ? "" : String(item.preparation_time),
        display_order: String(item.display_order ?? 0),
        is_active: Boolean(item.is_active),
        is_available: Boolean(item.is_available),
        branch_assignments: (item.branches ?? []).map((branch) => ({
          branch_id: String(branch.id),
          selling_price:
            branch.pivot.selling_price == null
              ? ""
              : String(branch.pivot.selling_price),
          is_active: Boolean(branch.pivot.is_active),
          is_available: Boolean(branch.pivot.is_available),
          display_order: String(branch.pivot.display_order ?? 0),
        })),
        variant_option_assignments: (item.variant_options ?? []).map(
          (option) => ({
            variant_option_id: Number(option.id),
            additional_price: String(option.pivot?.additional_price ?? 0),
            is_default: Boolean(option.pivot?.is_default),
            is_active: Boolean(option.pivot?.is_active),
            display_order: String(option.pivot?.display_order ?? 0),
          }),
        ),
      });
      setErrors({});
      setIsOpen(true);
    } catch (error) {
      console.error("Unable to load menu item", error);
    }
  };

  const updateForm = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const setBranchIds = (branchIds) => {
    setForm((current) => ({
      ...current,
      branch_assignments: branchIds.map(
        (branchId) =>
          current.branch_assignments.find(
            (assignment) => assignment.branch_id === branchId,
          ) ?? {
            branch_id: branchId,
            selling_price: "",
            is_active: true,
            is_available: true,
            display_order: "0",
          },
      ),
    }));
  };

  const updateBranch = (branchId, field, value) => {
    setForm((current) => ({
      ...current,
      branch_assignments: current.branch_assignments.map((assignment) =>
        assignment.branch_id === branchId
          ? { ...assignment, [field]: value }
          : assignment,
      ),
    }));
  };

  const toggleVariantOption = (option, checked) => {
    setForm((current) => ({
      ...current,
      variant_option_assignments: checked
        ? [
            ...current.variant_option_assignments,
            {
              variant_option_id: option.id,
              additional_price: String(option.default_additional_price ?? 0),
              is_default: false,
              is_active: true,
              display_order: String(option.display_order ?? 0),
            },
          ]
        : current.variant_option_assignments.filter(
            (assignment) => assignment.variant_option_id !== option.id,
          ),
    }));
  };

  const updateVariantAssignment = (id, field, value) =>
    setForm((current) => ({
      ...current,
      variant_option_assignments: current.variant_option_assignments.map(
        (assignment) =>
          assignment.variant_option_id === id
            ? { ...assignment, [field]: value }
            : assignment,
      ),
    }));

  const save = async () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.sku.trim()) nextErrors.sku = "SKU is required.";
    if (!form.menu_category_id)
      nextErrors.menu_category_id = "Choose a category.";
    if (form.branch_assignments.length === 0)
      nextErrors.branch_assignments =
        "Assign this item to at least one branch.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      menu_category_id: Number(form.menu_category_id),
      base_price: Number(form.base_price || 0),
      base_cost: Number(form.base_cost || 0),
      image_path: form.image_path.trim(),
      preparation_time:
        form.preparation_time === "" ? null : Number(form.preparation_time),
      display_order: Number(form.display_order || 0),
      branch_assignments: form.branch_assignments.map((assignment) => ({
        ...assignment,
        branch_id: Number(assignment.branch_id),
        selling_price:
          assignment.selling_price === ""
            ? null
            : Number(assignment.selling_price),
        display_order: Number(assignment.display_order || 0),
      })),
      variant_option_assignments: form.variant_option_assignments.map(
        (assignment) => ({
          ...assignment,
          variant_option_id: Number(assignment.variant_option_id),
          additional_price: Number(assignment.additional_price || 0),
          display_order: Number(assignment.display_order || 0),
        }),
      ),
    };

    setIsSubmitting(true);
    try {
      delete payload.image_path;
      let savedItem;
      if (editingId) {
        await api.put(`/menu-items/${editingId}`, payload);
        const { data } = await api.get(`/menu-items/${editingId}`);
        savedItem = data.data;
      } else {
        const { data } = await api.post("/menu-items", payload);
        savedItem = data.data;
      }
      if (form.image_file || form.image_path.trim()) {
        const existingImages = savedItem.images ?? [];
        const currentPrimary =
          existingImages.find((image) => image.is_primary) ?? existingImages[0];
        if (
          form.image_file ||
          currentPrimary?.image_path !== form.image_path.trim()
        ) {
          const imagePayload = new FormData();
          imagePayload.append("menu_item_id", savedItem.id);
          imagePayload.append("alt_text", form.name.trim());
          imagePayload.append("is_primary", "1");
          imagePayload.append("display_order", "0");
          if (form.image_file) imagePayload.append("image", form.image_file);
          else imagePayload.append("image_path", form.image_path.trim());
          await api.post("/menu-item-images", imagePayload, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }
      await loadData();
      setIsOpen(false);
    } catch (error) {
      const responseErrors = error.response?.data?.errors ?? {};
      setErrors(
        Object.fromEntries(
          Object.entries(responseErrors).map(([key, messages]) => [
            key,
            messages?.[0] ?? "Invalid value.",
          ]),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.name}?`)) return;
    await api.delete(`/menu-items/${row.id}`);
    await loadData();
  };

  const rows = items.map((item) => ({
    ...item,
    category_name: item.category ?? "—",
    branches_label:
      (item.branches ?? []).map((branch) => branch.name).join(", ") || "—",
    price_label: Number(item.base_price).toFixed(2),
    active_label: item.is_active
      ? item.is_available
        ? "Active · Available"
        : "Active · Unavailable"
      : "Inactive",
  }));
  const columns = [
    { key: "sku", label: "SKU", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "category_name", label: "Category", sortable: true },
    { key: "branches_label", label: "Branches" },
    { key: "price_label", label: "Base price" },
    { key: "active_label", label: "Status" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-950 dark:text-[#F7F8F8]">
            Menu Items
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#8A8F98]">
            Manage shared items and branch-specific prices and availability.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Add Menu Item
        </Button>
      </div>

      <Table
        columns={columns}
        data={rows}
        selectable={false}
        expandable={false}
        searchable
        filterable={false}
        pagination
        actions={(row) => [
          {
            label: "Item actions",
            render: () => (
              <ActionMenu
                label={`Actions for ${row.name}`}
                items={[
                  { label: "Edit item", onClick: () => openEdit(row) },
                  {
                    label: "Delete item",
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
        title={editingId ? "Edit Menu Item" : "Add Menu Item"}
        size="medium"
        primaryButtonText={
          isSubmitting ? "Saving..." : editingId ? "Update" : "Save"
        }
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isSubmitting}
        secondaryButtonDisabled={isSubmitting}
        onPrimaryButtonClick={save}
        onSecondaryButtonClick={() => setIsOpen(false)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={(event) => updateForm("name", event.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="SKU"
            required
            value={form.sku}
            onChange={(event) =>
              updateForm("sku", event.target.value.toUpperCase())
            }
            error={!!errors.sku}
            helperText={errors.sku}
          />
          <SelectField
            label="Category"
            required
            fullWidth
            value={form.menu_category_id}
            options={categories.map((category) => ({
              value: String(category.id),
              label: category.name,
            }))}
            onChange={(event) =>
              updateForm("menu_category_id", event.target.value)
            }
            error={!!errors.menu_category_id}
            helperText={errors.menu_category_id}
          />
          <NumberField
            label="Base price"
            min={0}
            step={0.01}
            value={form.base_price}
            onChange={(event) => updateForm("base_price", event.target.value)}
          />
          <NumberField
            label="Base cost"
            min={0}
            step={0.01}
            value={form.base_cost}
            onChange={(event) => updateForm("base_cost", event.target.value)}
          />
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-[#D0D6E0]">
            Upload item image
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                updateForm("image_file", event.target.files?.[0] ?? null)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-[#30343A] dark:bg-[#111315]"
            />
            <span className="text-xs font-normal text-slate-500 dark:text-[#8A8F98]">
              Selecting a new image adds it to this item and makes it primary.
            </span>
          </label>
          <TextField
            label="Or image path / URL"
            value={form.image_path}
            onChange={(event) => updateForm("image_path", event.target.value)}
          />
          <NumberField
            label="Preparation time (minutes)"
            min={0}
            value={form.preparation_time}
            onChange={(event) =>
              updateForm("preparation_time", event.target.value)
            }
          />
          <NumberField
            label="Display order"
            min={0}
            value={form.display_order}
            onChange={(event) =>
              updateForm("display_order", event.target.value)
            }
          />
          <SelectField
            label="Branches"
            fullWidth
            multiple
            searchable
            value={form.branch_assignments.map(
              (assignment) => assignment.branch_id,
            )}
            options={branches}
            onChange={(event) => setBranchIds(event.target.value)}
            error={!!errors.branch_assignments}
            helperText={errors.branch_assignments}
          />
          <div className="flex flex-wrap gap-5 sm:col-span-2">
            <CheckboxField
              label="Catalog active"
              checked={form.is_active}
              onChange={(event) =>
                updateForm("is_active", event.target.checked)
              }
            />
            <CheckboxField
              label="Available for ordering"
              checked={form.is_available}
              onChange={(event) =>
                updateForm("is_available", event.target.checked)
              }
            />
          </div>
          <TextAreaField
            label="Description"
            fullWidth
            rows={3}
            value={form.description}
            onChange={(event) => updateForm("description", event.target.value)}
          />
          {form.branch_assignments.map((assignment) => (
            <div
              key={assignment.branch_id}
              className="grid gap-3 rounded-lg border border-slate-200 p-3 dark:border-[#1F2226] sm:col-span-2 sm:grid-cols-2"
            >
              <p className="font-semibold sm:col-span-2">
                {
                  branches.find(
                    (branch) => branch.value === assignment.branch_id,
                  )?.label
                }
              </p>
              <NumberField
                label="Branch selling price (blank uses base price)"
                min={0}
                step={0.01}
                value={assignment.selling_price}
                onChange={(event) =>
                  updateBranch(
                    assignment.branch_id,
                    "selling_price",
                    event.target.value,
                  )
                }
              />
              <NumberField
                label="Branch display order"
                min={0}
                value={assignment.display_order}
                onChange={(event) =>
                  updateBranch(
                    assignment.branch_id,
                    "display_order",
                    event.target.value,
                  )
                }
              />
              <CheckboxField
                label="Active at this branch"
                checked={assignment.is_active}
                onChange={(event) =>
                  updateBranch(
                    assignment.branch_id,
                    "is_active",
                    event.target.checked,
                  )
                }
              />
              <CheckboxField
                label="Available at this branch"
                checked={assignment.is_available}
                onChange={(event) =>
                  updateBranch(
                    assignment.branch_id,
                    "is_available",
                    event.target.checked,
                  )
                }
              />
            </div>
          ))}
          <section className="space-y-3 sm:col-span-2">
            <h3 className="font-semibold text-slate-900 dark:text-[#F7F8F8]">
              Variant options
            </h3>
            {variantGroups.length === 0 && (
              <p className="text-sm text-slate-500">
                Create variant groups first.
              </p>
            )}
            {variantGroups.map((group) => (
              <div
                key={group.id}
                className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-[#30343A]"
              >
                <p className="font-medium">
                  {group.name}{" "}
                  <span className="text-xs text-slate-500">
                    ({group.selection_type}; choose {group.min_select}–
                    {group.max_select})
                  </span>
                </p>
                {group.options?.map((option) => {
                  const assignment = form.variant_option_assignments.find(
                    (entry) => entry.variant_option_id === option.id,
                  );
                  return (
                    <div
                      key={option.id}
                      className="grid items-center gap-2 sm:grid-cols-[1fr_140px_auto]"
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(assignment)}
                          onChange={(event) =>
                            toggleVariantOption(option, event.target.checked)
                          }
                        />
                        {option.name}
                      </label>
                      {assignment && (
                        <NumberField
                          label="Item price add-on"
                          min={0}
                          step={0.01}
                          value={assignment.additional_price}
                          onChange={(event) =>
                            updateVariantAssignment(
                              option.id,
                              "additional_price",
                              event.target.value,
                            )
                          }
                        />
                      )}
                      {assignment && (
                        <CheckboxField
                          label="Default"
                          checked={assignment.is_default}
                          onChange={(event) =>
                            updateVariantAssignment(
                              option.id,
                              "is_default",
                              event.target.checked,
                            )
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </section>
        </div>
      </Dialog>
    </div>
  );
};

export default MenuItems;
