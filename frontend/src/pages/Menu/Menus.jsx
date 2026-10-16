import React, { useState, useMemo, useEffect } from "react";
import {
  SelectField,
  TextField,
  NumberField,
  CheckboxField,
  RadioField,
  Button,
  TextAreaField,
  ToggleSwitch,
  ImageUploadField,
  CategoryTreeField,
  PhoneField,
} from "../../components/DataFields";
import { Table } from "../../components/Tables";
import { Accordion } from "../../components/Accordion";
import {
  Alert,
  Dialog,
  Snackbar,
  Loading,
  Drawer,
} from "../../components/Popups";
import { SectionDivider, VerticalTabs } from "../../components/SectionDivider";
import { Stepper } from "../../components/Stepper";
import { AddItem } from "../../components/AddItem";
import api from "../../axiosClient";

export const Menus = () => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    branch_ids: [],
    menu_item_ids: [],
    display_order: "0",
    is_active: true,
    description: "",
  });
  const [branchFilter, setBranchFilter] = useState("");

  const [showAddMenus, setShowAddMenus] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [Menus, setMenus] = useState([]);
  const [editingMenus, setEditingMenus] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewMenus, setShowViewMenus] = useState(false);
  const [viewMenus, setViewMenus] = useState(null);
  const [branches, setBranches] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/branches"), api.get("/menu-items")])
      .then(([branchResponse, itemResponse]) => {
        setBranches(branchResponse.data.data.data.map((branch) => ({ value: String(branch.id), label: branch.name })));
        setMenuItems(itemResponse.data.data);
      })
      .catch((error) => console.error("Failed to load menu assignment options", error));
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await api.get("/menus");
      console.log("Fetched menus:", response);
      const menuData = response.data.data.map((menus) => ({
        id: menus.id,
        name: menus.name,
        description: menus.description,
        branch: menus.branches?.map((branch) => branch.name).join(", ") || "—",
        branch_ids: menus.branches?.map((branch) => String(branch.id)) || [],
        menu_item_ids: menus.menu_items?.map((item) => String(item.id)) || [],
        menu_item_count: menus.menu_items?.length ?? 0,
        display_order: menus.display_order,
        code: menus.code || "",
        active_label: menus.is_active ? "Active" : "Inactive",
      }));
      setMenus(menuData);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const columns = [
    { key: "code", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "branch", label: "Branches", sortable: true },
    { key: "menu_item_count", label: "Items" },
    { key: "display_order", label: "Order", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "active_label", label: "Status" },
  ];

  const handleEditMenus = async (row) => {
    try {
      console.log("Editing menu with ID:", row.id);
      const response = await api.get(`/menus/${row.id}`);
      const menu = response.data.data;

      setEditingMenus(menu);
      setIsEditMode(true);

      setFormData({
        id: menu.id,
        name: menu.name || "",
        code: menu.code || "",
        description: menu.description || "",
        branch_ids: menu.branches?.map((branch) => String(branch.id)) || [],
        menu_item_ids: menu.menu_items?.map((item) => String(item.id)) || [],
        display_order: String(menu.display_order ?? 0),
        is_active: Boolean(menu.is_active),
      });

      setShowAddMenus(true);
    } catch (error) {
      console.error(error);
    }
  };

  const setFieldError = (field, message) => {
    setFieldErrors((prev) => {
      const next = { ...prev };

      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }

      return next;
    });
  };

  const validateSubmit = () => {
    const errors = {};

    if (!(formData.name || "").trim()) errors.name = "Name is required.";
    if (!(formData.code || "").trim()) errors.code = "Code is required.";
    if (!formData.branch_ids.length) errors.branch_ids = "Select at least one branch.";

    setFieldErrors(errors);
    console.log(errors);
    return Object.keys(errors).length === 0;
  };

  const resetAddMenusForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      branch_ids: [],
      menu_item_ids: [],
      display_order: "0",
      is_active: true,
    });
    setFieldErrors({});
  };

  const handleCloseAddMenus = () => {
    resetAddMenusForm();
    setShowAddMenus(false);
    setIsEditMode(false);
    setEditingMenus(null);
  };

  const handleSubmitMenus = async () => {
    console.log(fieldErrors);
    if (!validateSubmit()) return;

    const menus = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description,
      branch_ids: formData.branch_ids.map(Number),
      menu_item_ids: formData.menu_item_ids.map(Number),
      display_order: Number(formData.display_order || 0),
      is_active: formData.is_active,
    };

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/menus/${editingMenus.id}`, menus);
      } else {
        await api.post("/menus", menus);
      }
      await fetchMenus();
      handleCloseAddMenus();
    } catch (error) {
      const errors = error.response?.data?.errors || {};
      setFieldErrors({
        name: errors.name?.[0],
        code: errors.code?.[0],
        branch_ids: errors.branch_ids?.[0] || errors["branch_ids.0"]?.[0],
        menu_item_ids: errors.menu_item_ids?.[0] || errors["menu_item_ids.0"]?.[0],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenus = async (row) => {
    try {
      await api.delete(`/menus/${row.id}`);

      //      const user = response.data.data;

      // Refresh the table
      fetchMenus();

      console.log("Menus deleted successfully.");
    } catch (error) {
      console.error("Failed to delete menus:", error);
    }
  };

  const handleViewMenus = async (row) => {
    try {
      const response = await api.get(`/menus/${row.id}`);

      setViewMenus(response.data.data);
      setShowViewMenus(true);
    } catch (error) {
      console.error(error);
    }
  };

  const DetailItem = ({ label, value, wide = false }) => (
    <div
      className={`rounded border border-slate-200 bg-white px-3.5 py-2.5 dark:border-[#1F2226] dark:bg-[#161719] ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-medium uppercase text-gray-500 dark:text-[#8A8F98]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-[#F7F8F8]">
        {value || "Not provided"}
      </p>
    </div>
  );
  const availableMenuItemOptions = menuItems
    .filter((item) => item.branches?.some((branch) => formData.branch_ids.includes(String(branch.id)) && branch.pivot.is_active && branch.pivot.is_available))
    .map((item) => ({ value: String(item.id), label: `${item.sku} · ${item.name}` }));
  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-[#F7F8F8]">
            Menus
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#8A8F98]">
            Organize the menus available to your locations.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            resetAddMenusForm();
            setShowAddMenus(true);
          }}
          startIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
        >
          Add Menus
        </Button>
        <Dialog
          isOpen={showAddMenus}
          onClose={handleCloseAddMenus}
          title={isEditMode ? "Edit Menus" : "Add Menus"}
          size="medium"
          primaryButtonText={
            isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"
          }
          secondaryButtonText="Cancel"
          primaryButtonDisabled={isSubmitting}
          secondaryButtonDisabled={isSubmitting}
          onPrimaryButtonClick={handleSubmitMenus}
          onSecondaryButtonClick={handleCloseAddMenus}
        >
          <div className="space-y-5 mb-4">
            <TextField
              required
              label="Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setFieldError("name", "");
              }}
              helperText={fieldErrors.name || ""}
              error={!!fieldErrors.name}
            />
            <TextField
              required
              label="Code"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.toUpperCase() });
                setFieldError("code", "");
              }}
              helperText={fieldErrors.code || ""}
              error={!!fieldErrors.code}
            />
          </div>
          <div className="space-y-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <SelectField
              required
              fullWidth
              multiple
              searchable
              label="Select Branches"
              value={formData.branch_ids}
              options={branches}
              onChange={(e) => {
                setFormData({ ...formData, branch_ids: e.target.value });
                setFieldError("branch_ids", "");
              }}
              helperText={fieldErrors.branch_ids || "Select every branch where this menu is available."}
              error={!!fieldErrors.branch_ids}
            />
            <CheckboxField label="Active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
            <NumberField label="Display order" min={0} value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: e.target.value })} />
            <SelectField
              fullWidth
              multiple
              searchable
              label="Menu Items"
              value={formData.menu_item_ids}
              options={availableMenuItemOptions}
              onChange={(e) => {
                setFormData({ ...formData, menu_item_ids: e.target.value });
                setFieldError("menu_item_ids", "");
              }}
              helperText={fieldErrors.menu_item_ids || "Only items available at selected branches are listed."}
              error={!!fieldErrors.menu_item_ids}
            />
          </div>
          <TextAreaField
            label="Description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
            }}
            rows={2}
            resize="vertical"
            maxLength={100}
          />
        </Dialog>
      </div>
      <Accordion
        items={[
          {
            title: "Additional Search",
            content: (
              <div className="flex  gap-3.5 w-full">
                <SelectField
                  label="Branch"
                  value={branchFilter}
                  options={branches}
                  onChange={(e) =>
                    setBranchFilter(e.target.value)
                  }
                  fullWidth={true}
                />
              </div>
            ),
          },
        ]}
        allowMultiple={false}
        iconPosition="right"
        defaultExpanded={[]}
        variant="filled"
      />
      <div className="mt-4">
        <Table
          columns={columns}
          data={Menus}
          selectable={false}
          expandable={false}
          searchable={true}
          filterable={false}
          pagination={true}
          actions={[
            {
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              ),
              label: "Edit",
              onClick: handleEditMenus,
            },
            {
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              ),
              label: "Delete",
              onClick: handleDeleteMenus,
            },
            {
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ),
              label: "View",
              onClick: handleViewMenus,
            },
          ]}
        />
      </div>

      <Dialog
        isOpen={showViewMenus}
        onClose={() => setShowViewMenus(false)}
        title="Menu Profile"
        size="medium"
        showFooter={false}
      >
        {viewMenus && (
          <div className="space-y-5">
            <div className="rounded border border-slate-200 bg-gray-50 p-4.5 dark:border-[#1F2226] dark:bg-[#161719]">
              <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-950 dark:text-[#F7F8F8]">
                    {`${viewMenus.name || ""}`.trim() || "Not provided"}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                    {viewMenus.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-[#F7F8F8]">
                Menu Details
              </h4>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <DetailItem label="Name" value={viewMenus.name} />
                <DetailItem label="Status" value={viewMenus.is_active ? "Active" : "Inactive"} />
                <DetailItem label="Branches" value={viewMenus.branches?.map((branch) => branch.name).join(", ")} />
                <DetailItem label="Menu Items" value={viewMenus.menu_items?.map((item) => item.name).join(", ")} wide />
              </div>
              <div className="mt-4"></div>
              <DetailItem label="Description" value={viewMenus.description} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Menus;
