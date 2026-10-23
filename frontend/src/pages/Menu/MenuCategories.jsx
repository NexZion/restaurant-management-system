import { useEffect, useState } from "react";
import { ActionMenu } from "../../components/ActionMenu";
import {
  Button,
  ImageGridUploadField,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "../../components/DataFields";
import { Dialog } from "../../components/Popups";
import { Table } from "../../components/Tables";
import api from "../../axiosClient";
import { storageUrl } from "../../utils/storageUrl";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  image_path: "",
  image_file: null,
  display_order: "0",
  is_active: true,
};

const previewDescription = (description) => {
  const words = (description || "").trim().split(/\s+/).filter(Boolean);
  return words.length
    ? `${words.slice(0, 8).join(" ")}${words.length > 8 ? "..." : ""}`
    : "-";
};

export const MenuCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [reassignmentCategory, setReassignmentCategory] = useState(null);
  const [reassignmentTargetId, setReassignmentTargetId] = useState("");
  const [isReassigningItems, setIsReassigningItems] = useState(false);
  const [reassignmentError, setReassignmentError] = useState("");
  const [categoryLookupError, setCategoryLookupError] = useState("");
  const [viewCategory, setViewCategory] = useState(null);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [viewError, setViewError] = useState("");

  const loadData = async () => {
    setIsCategoriesLoading(true);
    try {
      const categoryResponse = await api.get("/menu-categories");
      setCategories(categoryResponse.data.data);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch((error) =>
      console.error("Unable to load menu categories", error),
    );
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setFormError("");
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
        image_file: null,
        display_order: String(category.display_order ?? 0),
        is_active: Boolean(category.is_active),
      });
      setErrors({});
      setFormError("");
      setIsOpen(true);
    } catch (error) {
      console.error("Unable to load category", error);
    }
  };

  const openViewItems = async (row) => {
    setViewCategory(row);
    setIsLoadingView(true);
    setViewError("");
    try {
      const { data } = await api.get(`/menu-categories/${row.id}`);
      setViewCategory(data.data);
    } catch (error) {
      setViewError(
        error.response?.data?.message || "Unable to load category items.",
      );
    } finally {
      setIsLoadingView(false);
    }
  };

  const save = async () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.code.trim()) nextErrors.code = "Code is required.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setFormError("");
    const payload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      display_order: Number(form.display_order || 0),
    };
    setIsSubmitting(true);
    try {
      const { image_file, ...categoryPayload } = payload;
      let savedCategory;
      if (image_file) {
        const formData = new FormData();
        Object.entries(categoryPayload).forEach(([key, value]) => {
          formData.append(
            key,
            typeof value === "boolean" ? Number(value) : (value ?? ""),
          );
        });
        formData.append("image_file", image_file);
        if (editingId) {
          formData.append("_method", "PUT");
          const response = await api.post(
            `/menu-categories/${editingId}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          savedCategory = response.data.data;
        } else {
          const response = await api.post("/menu-categories", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          savedCategory = response.data.data;
        }
      } else if (editingId) {
        const response = await api.put(
          `/menu-categories/${editingId}`,
          categoryPayload,
        );
        savedCategory = response.data.data;
      } else {
        const response = await api.post("/menu-categories", categoryPayload);
        savedCategory = response.data.data;
      }
      if (!editingId && reassignmentCategory && savedCategory?.id) {
        setCategories((current) => [
          ...current.filter(
            (category) => Number(category.id) !== Number(savedCategory.id),
          ),
          savedCategory,
        ]);
        setReassignmentTargetId(String(savedCategory.id));
      }
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
      setFormError(
        error.response?.data?.message ||
          error.message ||
          "Unable to save this category. Please check the details and try again.",
      );
      return;
    } finally {
      setIsSubmitting(false);
    }
    setIsOpen(false);
    loadData().catch((error) =>
      console.error(
        "Category saved, but the category list could not refresh",
        error,
      ),
    );
  };

  const remove = async (row) => {
    setDeleteError("");
    setCategoryLookupError("");
    setReassignmentError("");
    setReassignmentTargetId("");
    try {
      const { data } = await api.get(`/menu-categories/${row.id}`);
      const category = data.data;
      if (category.menu_items?.length) {
        setReassignmentCategory(category);
      } else {
        setCategoryToDelete(category);
      }
    } catch (error) {
      setCategoryLookupError(
        error.response?.data?.message ||
          "Unable to check this category's items. Try again before deleting.",
      );
    }
  };

  const assignItemsAndContinue = async () => {
    if (!reassignmentCategory || !reassignmentTargetId) {
      setReassignmentError("Choose another category for these items.");
      return;
    }
    setIsReassigningItems(true);
    setReassignmentError("");
    try {
      await api.post(
        `/menu-categories/${reassignmentCategory.id}/reassign-items`,
        {
          target_category_id: Number(reassignmentTargetId),
        },
      );
      const categoryToRemove = reassignmentCategory;
      setReassignmentCategory(null);
      setCategoryToDelete(categoryToRemove);
    } catch (error) {
      setReassignmentError(
        error.response?.data?.message ||
          "Unable to assign the items to the selected category.",
      );
    } finally {
      setIsReassigningItems(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    setDeleteError("");
    try {
      await api.delete(`/menu-categories/${categoryToDelete.id}`);
      await loadData();
      setCategoryToDelete(null);
    } catch (error) {
      setDeleteError(
        error.response?.data?.message ||
          "Unable to delete this category. Please try again.",
      );
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const rows = [...categories]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .map((category) => ({
      ...category,
      active_label: category.is_active ? "Active" : "Inactive",
      description_preview: previewDescription(category.description),
      item_count: category.menu_items_count ?? 0,
    }));
  const columns = [
    { key: "code", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "description_preview", label: "Description" },
    { key: "item_count", label: "Items", sortable: true },
    { key: "active_label", label: "Status" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-950 dark:text-[#F7F8F8]">
            Menu Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#8A8F98]">
            Manage categories available across all branches and menu items.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Add Category
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
        loading={isCategoriesLoading}
        actionsAlign="right"
        showActionsHeader={false}
        actions={(row) => [
          {
            label: "Category actions",
            render: () => (
              <ActionMenu
                label={`Actions for ${row.name}`}
                items={[
                  { label: "View Category", onClick: () => openViewItems(row) },
                  { label: "Edit category", onClick: () => openEdit(row) },
                  {
                    label: "Delete category",
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
        isOpen={!!categoryLookupError}
        onClose={() => setCategoryLookupError("")}
        title="Unable to check category"
        size="small"
        secondaryButtonText="Close"
        onSecondaryButtonClick={() => setCategoryLookupError("")}
        showPrimaryButton={false}
      >
        <p className="text-sm text-slate-600 dark:text-[#B7BBC3]">
          {categoryLookupError}
        </p>
      </Dialog>
      <Dialog
        isOpen={!!reassignmentCategory}
        onClose={() => !isReassigningItems && setReassignmentCategory(null)}
        title={`Move items from ${reassignmentCategory?.name || "category"}`}
        size="large"
        primaryButtonText={isReassigningItems ? "Assigning..." : "Assign"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isReassigningItems || !reassignmentTargetId}
        secondaryButtonDisabled={isReassigningItems}
        onPrimaryButtonClick={assignItemsAndContinue}
        onSecondaryButtonClick={() => setReassignmentCategory(null)}
      >
        {reassignmentCategory && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-[#1F2226]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-[#F7F8F8]">
                    Items in {reassignmentCategory.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-[#8A8F98]">
                    Choose a destination category before deleting this category.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-[#1A1C20] dark:text-[#B7BBC3]">
                  {reassignmentCategory.menu_items?.length || 0} items
                </span>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {reassignmentCategory.menu_items?.map((item) => {
                  const image =
                    item.images?.find((entry) => entry.is_primary)
                      ?.image_path || item.images?.[0]?.image_path;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5 dark:bg-[#1A1C20]"
                    >
                      {image ? (
                        <img
                          src={
                            /^https?:\/\//i.test(image)
                              ? image
                              : storageUrl(image)
                          }
                          alt={item.name}
                          className="h-11 w-11 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-200 text-[10px] text-slate-500 dark:bg-[#252a35]">
                          No image
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-[#F7F8F8]">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#8A8F98]">
                          {item.sku}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <SelectField
                  label="Move items to category"
                  required
                  fullWidth
                  value={reassignmentTargetId}
                  options={categories
                    .filter(
                      (category) =>
                        Number(category.id) !== Number(reassignmentCategory.id),
                    )
                    .map((category) => ({
                      value: String(category.id),
                      label: `${category.name} (${category.code})`,
                    }))}
                  onChange={(event) =>
                    setReassignmentTargetId(event.target.value)
                  }
                />
              </div>
              <Button variant="secondary" onClick={openCreate}>
                Create category
              </Button>
            </div>
            {reassignmentError && (
              <p
                role="alert"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {reassignmentError}
              </p>
            )}
          </div>
        )}
      </Dialog>
      <Dialog
        isOpen={!!viewCategory}
        onClose={() => setViewCategory(null)}
        title="Category details"
        size="medium"
        showFooter={false}
      >
        {isLoadingView ? (
          <p className="text-sm text-slate-500 dark:text-[#8A8F98]">
            Loading category items...
          </p>
        ) : viewError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {viewError}
          </p>
        ) : (
          viewCategory && (
            <div className="space-y-5">
              <section className="rounded-xl border border-slate-200 p-4 dark:border-[#1F2226]">
                <div className="flex items-start gap-4">
                  {viewCategory.image_path && (
                    <img
                      src={
                        /^https?:\/\//i.test(viewCategory.image_path)
                          ? viewCategory.image_path
                          : storageUrl(viewCategory.image_path)
                      }
                      alt={viewCategory.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-950 dark:text-[#F7F8F8]">
                        {viewCategory.name}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-[#1A1C20] dark:text-[#B7BBC3]">
                        {viewCategory.code}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${viewCategory.is_active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-[#1A1C20] dark:text-[#8A8F98]"}`}
                      >
                        {viewCategory.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {viewCategory.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-[#B7BBC3]">
                        {viewCategory.description}
                      </p>
                    )}
                  </div>
                </div>
              </section>
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-[#F7F8F8]">
                    Menu items
                  </h4>
                  <span className="text-sm text-slate-500 dark:text-[#8A8F98]">
                    {viewCategory.menu_items?.length || 0} items
                  </span>
                </div>
                {viewCategory.menu_items?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {viewCategory.menu_items.map((item) => {
                      const image =
                        item.images?.find((entry) => entry.is_primary)
                          ?.image_path || item.images?.[0]?.image_path;
                      return (
                        <article
                          key={item.id}
                          className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-[#1F2226]"
                        >
                          {image ? (
                            <img
                              src={
                                /^https?:\/\//i.test(image)
                                  ? image
                                  : storageUrl(image)
                              }
                              alt={item.name}
                              className="h-14 w-14 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-[#1A1C20]">
                              No image
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-900 dark:text-[#F7F8F8]">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-[#8A8F98]">
                              {item.sku} ·{" "}
                              {item.is_active ? "Active" : "Inactive"}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-medium text-slate-700 dark:text-[#D0D6E0]">
                            {Number(item.base_price || 0).toFixed(2)}
                          </span>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-[#1F2226] dark:text-[#8A8F98]">
                    No menu items have been added to this category yet.
                  </p>
                )}
              </section>
            </div>
          )
        )}
      </Dialog>
      <Dialog
        isOpen={!!categoryToDelete}
        onClose={() => !isDeletingCategory && setCategoryToDelete(null)}
        title="Delete category?"
        size="small"
        primaryButtonText={isDeletingCategory ? "Deleting..." : "Delete"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isDeletingCategory}
        secondaryButtonDisabled={isDeletingCategory}
        onPrimaryButtonClick={confirmDelete}
        onSecondaryButtonClick={() => setCategoryToDelete(null)}
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-[#B7BBC3]">
          <p>
            Are you sure you want to delete{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {categoryToDelete?.name}
            </span>
            ? This action cannot be undone.
          </p>
          {deleteError && (
            <p role="alert" className="text-red-600 dark:text-red-400">
              {deleteError}
            </p>
          )}
        </div>
      </Dialog>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingId ? "Edit Category" : "Add Category"}
        size="medium"
        zIndex={reassignmentCategory ? 60 : 50}
        primaryButtonText={
          isSubmitting ? "Saving..." : editingId ? "Update" : "Save"
        }
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isSubmitting}
        secondaryButtonDisabled={isSubmitting}
        onPrimaryButtonClick={save}
        onSecondaryButtonClick={() => setIsOpen(false)}
      >
        {formError && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
          >
            {formError}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Code"
            required
            value={form.code}
            onChange={(event) =>
              setForm({ ...form, code: event.target.value.toUpperCase() })
            }
            error={!!errors.code}
            helperText={errors.code}
          />
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
            <ImageGridUploadField
              key={editingId || "new-category"}
              label="Category image"
              value={form.image_file || form.image_path}
              onChange={(image) =>
                setForm({
                  ...form,
                  image_file: image,
                  image_path: image ? form.image_path : null,
                })
              }
              aspectRatio="1.25/1"
              imageFit="contain"
              fullWidth
              className="sm:row-span-3"
              error={!!errors.image_file}
              helperText={
                errors.image_file || "Upload an image for this category."
              }
            />
            <div className="grid content-start gap-4">
              <NumberField
                label="Display order"
                min={0}
                value={form.display_order}
                onChange={(event) =>
                  setForm({ ...form, display_order: event.target.value })
                }
                className="sm:mt-5"
              />
              <SelectField
                label="Status"
                required
                fullWidth
                value={form.is_active ? "active" : "inactive"}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                onChange={(event) =>
                  setForm({
                    ...form,
                    is_active: event.target.value === "active",
                  })
                }
              />
              <TextAreaField
                label="Description"
                fullWidth
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MenuCategories;
