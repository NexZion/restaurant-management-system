import { useEffect, useState } from "react";
import { ActionMenu } from "../../components/ActionMenu";
import {
  Button,
  CheckboxField,
  ImageListField,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "../../components/DataFields";
import { Dialog } from "../../components/Popups";
import { Table } from "../../components/Tables";
import { storageUrl } from "../../utils/storageUrl";
import { getStoredUser } from "../../utils/authStorage";
import api from "../../axiosClient";

const emptyForm = {
  name: "",
  sku: "",
  menu_category_id: "",
  description: "",
  base_price: "0",
  base_cost: "0",
  images: [],
  preparation_time: "",
  display_order: "0",
  is_active: true,
  is_available: true,
  variant_option_assignments: [],
};

const groupOptionsByVariant = (options = []) => {
  const groups = new Map();
  options.forEach((option) => {
    const id = option.variant_id ?? option.variant?.id ?? option.variant_name ?? "other";
    const name = option.variant?.name ?? option.variant_name ?? "Other options";
    if (!groups.has(id)) groups.set(id, { id, name, options: [] });
    groups.get(id).options.push(option);
  });
  return [...groups.values()];
};

export const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [deleteItemError, setDeleteItemError] = useState("");
  const [categories, setCategories] = useState([]);
  const [variantGroups, setVariantGroups] = useState([]);
  const [selectedVariantGroupIds, setSelectedVariantGroupIds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [viewingItem, setViewingItem] = useState(null);
  const [availabilityItem, setAvailabilityItem] = useState(null);
  const [availabilityBranchId, setAvailabilityBranchId] = useState("");
  const [availabilityForm, setAvailabilityForm] = useState({
    is_available: false,
    variant_options: [],
  });
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const loadData = async () => {
    setIsLoadingItems(true);
    try {
      const [itemResponse, categoryResponse, variantResponse] = await Promise.all(
        [
          api.get("/menu-items"),
          api.get("/menu-categories"),
          api.get("/variants"),
        ],
      );
      setItems(itemResponse.data.data);
      setCategories(
        categoryResponse.data.data.filter((category) => category.is_active),
      );
      setVariantGroups(
        variantResponse.data.data.filter((variant) => variant.is_active),
      );
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    loadData().catch((error) =>
      console.error("Unable to load menu items", error),
    );
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedVariantGroupIds([]);
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
        images: (item.images ?? [])
          .slice()
          .sort(
            (a, b) =>
              Number(a.display_order ?? 0) - Number(b.display_order ?? 0),
          )
          .map((image) => ({
            ...image,
            image: image.image_path,
            name: image.alt_text || image.image_path?.split("/").pop(),
          })),
        preparation_time:
          item.preparation_time == null ? "" : String(item.preparation_time),
        display_order: String(item.display_order ?? 0),
        is_active: Boolean(item.is_active),
        is_available: Boolean(item.is_available),
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
      setSelectedVariantGroupIds([
        ...new Set(
          (item.variant_options ?? []).map((option) =>
            String(option.variant_id),
          ),
        ),
      ]);
      setErrors({});
      setIsOpen(true);
    } catch (error) {
      console.error("Unable to load menu item", error);
    }
  };

  const openView = async (row) => {
    try {
      const { data } = await api.get(`/menu-items/${row.id}`);
      setViewingItem(data.data);
    } catch (error) {
      console.error("Unable to load menu item details", error);
    }
  };

  const openAvailability = (row) => {
    const user = getStoredUser();
    const branchId =
      user?.branch_id ??
      user?.branch?.id ??
      localStorage.getItem("BRANCH_ID") ??
      "";
    setAvailabilityItem(row);
    setAvailabilityBranchId(String(branchId));
    setAvailabilityForm({ is_available: false, variant_options: [] });
    setAvailabilityError("");
    if (!branchId) {
      setAvailabilityError("The logged-in user is not assigned to a branch.");
      return;
    }
    setIsLoadingAvailability(true);
    api
      .get(`/menu-items/${row.id}/availability`, {
        params: { branch_id: branchId },
      })
      .then(({ data }) => setAvailabilityForm(data.data))
      .catch((error) =>
        setAvailabilityError(
          error.response?.data?.message ||
            "Unable to load branch availability.",
        ),
      )
      .finally(() => setIsLoadingAvailability(false));
  };

  const saveAvailability = async () => {
    if (!availabilityItem || !availabilityBranchId) return;
    setIsSavingAvailability(true);
    setAvailabilityError("");
    try {
      await api.put(`/menu-items/${availabilityItem.id}/availability`, {
        branch_id: Number(availabilityBranchId),
        is_available: availabilityForm.is_available,
        variant_options: availabilityForm.variant_options.map((option) => ({
          variant_option_id: Number(option.id),
          is_available: Boolean(option.is_available),
        })),
      });
      setAvailabilityItem(null);
      await loadData();
    } catch (error) {
      setAvailabilityError(
        Object.values(error.response?.data?.errors ?? {})
          .flat()
          .join("\n") ||
          error.response?.data?.message ||
          "Unable to save branch availability.",
      );
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const updateForm = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const setSelectedVariantGroups = (variantGroupIds) => {
    const selectedIds = variantGroupIds.map(String);
    setSelectedVariantGroupIds(selectedIds);
    const allowedOptionIds = new Set(
      variantGroups
        .filter((group) => selectedIds.includes(String(group.id)))
        .flatMap((group) => (group.options ?? []).map((option) => option.id)),
    );
    setForm((current) => ({
      ...current,
      variant_option_assignments: current.variant_option_assignments.filter(
        (assignment) => allowedOptionIds.has(assignment.variant_option_id),
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
      preparation_time:
        form.preparation_time === "" ? null : Number(form.preparation_time),
      display_order: Number(form.display_order || 0),
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
      delete payload.images;
      let savedItem;
      if (editingId) {
        await api.put(`/menu-items/${editingId}`, payload);
        const { data } = await api.get(`/menu-items/${editingId}`);
        savedItem = data.data;
      } else {
        const { data } = await api.post("/menu-items", payload);
        savedItem = data.data;
      }
      const retainedImageIds = new Set(
        form.images
          .filter((image) => image.id)
          .map((image) => Number(image.id)),
      );
      await Promise.all(
        (savedItem.images ?? [])
          .filter((image) => !retainedImageIds.has(Number(image.id)))
          .map((image) => api.delete(`/menu-item-images/${image.id}`)),
      );
      for (const [index, image] of form.images.entries()) {
        const imageFile =
          image instanceof File
            ? image
            : image?.image instanceof File
              ? image.image
              : null;
        const imageId = image?.id;
        if (imageId) {
          await api.put(`/menu-item-images/${imageId}`, {
            menu_item_id: savedItem.id,
            alt_text: image.alt_text || form.name.trim(),
            is_primary: index === 0,
            display_order: index,
          });
        } else if (imageFile) {
          const imagePayload = new FormData();
          imagePayload.append("menu_item_id", savedItem.id);
          imagePayload.append("alt_text", form.name.trim());
          imagePayload.append("is_primary", index === 0 ? "1" : "0");
          imagePayload.append("display_order", String(index));
          imagePayload.append("image", imageFile);
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
    setItemToDelete(row);
    setDeleteItemError("");
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeletingItem(true);
    setDeleteItemError("");
    try {
      await api.delete(`/menu-items/${itemToDelete.id}`);
      await loadData();
      setItemToDelete(null);
    } catch (error) {
      setDeleteItemError(
        error.response?.data?.message || "Unable to delete this menu item.",
      );
    } finally {
      setIsDeletingItem(false);
    }
  };

  const rows = items.map((item) => ({
    ...item,
    category_name: item.category ?? "—",
    menus_label: (item.menus ?? []).join(", ") || "—",
    price_label: Number(item.base_price).toFixed(2),
    availability_label: (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${item.available ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"}`}
      >
        {item.available ? "Available" : "Unavailable"}
      </span>
    ),
  }));
  const columns = [
    { key: "sku", label: "SKU", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "category_name", label: "Category", sortable: true },
    { key: "menus_label", label: "Menus" },
    { key: "price_label", label: "Base price" },
    { key: "availability_label", label: "Availability" },
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
        loading={isLoadingItems}
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
                  { label: "View item", onClick: () => openView(row) },
                  { label: "Edit item", onClick: () => openEdit(row) },
                  {
                    label: "Change availability",
                    onClick: () => openAvailability(row),
                  },
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
          <NumberField
            label="Preparation time (minutes)"
            min={0}
            value={form.preparation_time}
            onChange={(event) =>
              updateForm("preparation_time", event.target.value)
            }
          />
          <div className="sm:col-span-2">
            <ImageListField
              label="Item images"
              value={form.images}
              onChange={(images) => updateForm("images", images)}
              maxImages={10}
              helperText="Drag images to change their display order. The first image is the primary image."
            />
          </div>
          <div className="sm:col-span-2">
            <TextAreaField
              label="Description"
              fullWidth
              rows={3}
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
            />
          </div>
          <section className="space-y-4 sm:col-span-2">
            <h3 className="font-semibold text-slate-900 dark:text-[#F7F8F8]">
              Variants and options
            </h3>
            {variantGroups.length === 0 && (
              <p className="text-sm text-slate-500">
                Create variant groups first.
              </p>
            )}
            {variantGroups.length > 0 && (
              <SelectField
                label="Choose variants for this item"
                multiple
                searchable
                value={selectedVariantGroupIds}
                options={variantGroups.map((group) => ({
                  value: String(group.id),
                  label: group.name,
                }))}
                onChange={(event) =>
                  setSelectedVariantGroups(event.target.value)
                }
              />
            )}
            {variantGroups
              .filter((group) =>
                selectedVariantGroupIds.includes(String(group.id)),
              )
              .map((group) => (
                <div
                  key={group.id}
                  className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-[#30343A]"
                >
                  <p className="font-medium">
                    {group.name}{" "}
                    <span className="text-xs text-slate-500">
                      (At order time: choose {group.min_select}–
                      {group.max_select})
                    </span>
                  </p>
                  {group.options?.map((option) => {
                    const assignment = form.variant_option_assignments.find(
                      (entry) => entry.variant_option_id === option.id,
                    );
                    const anotherDefaultSelected =
                      assignment?.is_default !== true &&
                      form.variant_option_assignments.some(
                        (entry) =>
                          entry.is_default &&
                          entry.variant_option_id !== option.id &&
                          group.options.some(
                            (groupOption) =>
                              groupOption.id === entry.variant_option_id,
                          ),
                      );
                    return (
                      <div
                        key={option.id}
                        className="grid items-center gap-3 rounded-lg border border-slate-200/80 p-3 dark:border-[#25282D] sm:grid-cols-[minmax(0,1fr)_minmax(180px,220px)_auto]"
                      >
                        <CheckboxField
                          label={option.name}
                          checked={Boolean(assignment)}
                          onChange={(event) =>
                            toggleVariantOption(option, event.target.checked)
                          }
                        />
                        {assignment && (
                          <NumberField
                            label="Add-on price"
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
                            disabled={anotherDefaultSelected}
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

      <Dialog
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title="Menu item details"
        size="medium"
        showFooter={false}
      >
        {viewingItem && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-medium">{viewingItem.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">SKU</p>
                <p className="font-medium">{viewingItem.sku}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="font-medium">
                  {viewingItem.menu_category?.name ??
                    viewingItem.category ??
                    "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Base price</p>
                <p className="font-medium">
                  {Number(viewingItem.base_price || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Base cost</p>
                <p className="font-medium">
                  {Number(viewingItem.base_cost || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Preparation time</p>
                <p className="font-medium">
                  {viewingItem.preparation_time
                    ? `${viewingItem.preparation_time} min`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Menus</p>
                <p className="font-medium">
                  {[
                    ...new Set(
                      (viewingItem.menus ?? []).map((menu) => menu.name),
                    ),
                  ].join(", ") || "—"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Description</p>
                <p className="whitespace-pre-wrap font-medium">
                  {viewingItem.description || "—"}
                </p>
              </div>
            </div>
            {viewingItem.images?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Images</h3>
                <div className="flex flex-wrap gap-3">
                  {viewingItem.images.map((image) => (
                    <img
                      key={image.id}
                      src={storageUrl(image.image_path)}
                      alt={image.alt_text || viewingItem.name}
                      className="h-24 w-24 rounded-lg border border-slate-200 object-cover dark:border-[#30343A]"
                    />
                  ))}
                </div>
              </div>
            )}
            {viewingItem.variant_options?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Assigned variants</h3>
                <div className="space-y-3">
                  {groupOptionsByVariant(viewingItem.variant_options).map((group) => (
                    <section key={group.id} className="overflow-hidden rounded-lg border border-slate-200 dark:border-[#30343A]">
                      <h4 className="bg-slate-50 px-3 py-2 text-sm font-semibold dark:bg-[#202226]">{group.name}</h4>
                      <div className="divide-y divide-slate-100 dark:divide-[#25282D]">
                        {group.options.map((option) => (
                          <div key={option.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                            <span>{option.name}</span>
                            <span className="text-slate-500">+{Number(option.pivot?.additional_price ?? option.additional_price ?? 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={!!availabilityItem}
        onClose={() => !isSavingAvailability && setAvailabilityItem(null)}
        title="Change item availability"
        size="medium"
        primaryButtonText={isSavingAvailability ? "Saving..." : "Save"}
        primaryButtonDisabled={
          isSavingAvailability ||
          isLoadingAvailability ||
          !availabilityBranchId ||
          !availabilityItem
        }
        secondaryButtonText="Cancel"
        secondaryButtonDisabled={isSavingAvailability}
        onPrimaryButtonClick={saveAvailability}
        onSecondaryButtonClick={() => setAvailabilityItem(null)}
      >
        <div className="space-y-4">
          {availabilityItem && (
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3 dark:border-[#30343A] dark:bg-[#202226]">
              <div>
                <p className="text-xs text-slate-500 dark:text-[#8A8F98]">
                  Item name
                </p>
                <p className="font-medium">{availabilityItem.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-[#8A8F98]">
                  SKU
                </p>
                <p className="font-medium">{availabilityItem.sku}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-[#8A8F98]">
                  Category
                </p>
                <p className="font-medium">{availabilityItem.category_name}</p>
              </div>
            </div>
          )}
          {isLoadingAvailability ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 dark:border-[#5E6AD2]" />
            </div>
          ) : (
            <>
              <CheckboxField
                label="Item available at this branch"
                checked={availabilityForm.is_available}
                disabled={isSavingAvailability}
                onChange={(event) =>
                  setAvailabilityForm((current) => ({
                    ...current,
                    is_available: event.target.checked,
                  }))
                }
              />
              <div className="space-y-3">
                <h3 className="font-semibold">Variant availability</h3>
                {availabilityForm.variant_options.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    This item has no variant options assigned.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupOptionsByVariant(availabilityForm.variant_options).map((group) => (
                      <section key={group.id} className="overflow-hidden rounded-lg border border-slate-200 dark:border-[#30343A]">
                        <h4 className="bg-slate-50 px-3 py-2 text-sm font-semibold dark:bg-[#202226]">{group.name}</h4>
                        <div className="divide-y divide-slate-100 dark:divide-[#25282D]">
                          {group.options.map((option) => (
                            <div key={option.id} className="flex items-center justify-between gap-4 px-3 py-2.5">
                              <span className="text-sm">{option.name}</span>
                              <CheckboxField label="Available" checked={Boolean(option.is_available)} disabled={isSavingAvailability} onChange={(event) => setAvailabilityForm((current) => ({ ...current, variant_options: current.variant_options.map((entry) => entry.id === option.id ? { ...entry, is_available: event.target.checked } : entry) }))} />
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {availabilityError && (
            <p
              role="alert"
              className="whitespace-pre-line text-sm text-red-600 dark:text-red-400"
            >
              {availabilityError}
            </p>
          )}
        </div>
      </Dialog>

      <Dialog
        isOpen={!!itemToDelete}
        onClose={() => !isDeletingItem && setItemToDelete(null)}
        title="Delete menu item?"
        size="small"
        primaryButtonText={isDeletingItem ? "Deleting..." : "Delete"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isDeletingItem}
        secondaryButtonDisabled={isDeletingItem}
        onPrimaryButtonClick={confirmDeleteItem}
        onSecondaryButtonClick={() => setItemToDelete(null)}
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-[#B7BBC3]">
          <p>
            Are you sure you want to delete{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {itemToDelete?.name}
            </span>
            ? This action cannot be undone.
          </p>
          {deleteItemError && (
            <p role="alert" className="text-red-600 dark:text-red-400">
              {deleteItemError}
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default MenuItems;
