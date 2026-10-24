import { useState, useEffect } from "react";
import {
  SelectField,
  TextField,
  Button,
  TextAreaField,
} from "../../components/DataFields";
import { Table } from "../../components/Tables";
import { Dialog } from "../../components/Popups";
import { ActionMenu } from "../../components/ActionMenu";
import { ImageSelectListField } from "../../components/ImageSelectListField";
import api from "../../axiosClient";
import { storageUrl } from "../../utils/storageUrl";

const menuTypeOptions = [
  { value: "regular", label: "Regular" },
  { value: "seasonal", label: "Seasonal" },
  { value: "special", label: "Special" },
  { value: "event", label: "Event" },
];
const availabilityTypeOptions = [
  { value: "all_day", label: "All day" },
  { value: "scheduled", label: "Scheduled" },
  { value: "manual", label: "Manual" },
];
const menuStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const availableDayOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];
const serviceTypeOptions = [
  { value: "dine_in", label: "Dine-in" },
  { value: "takeaway", label: "Takeaway" },
  { value: "delivery", label: "Delivery" },
];
const resolveMenuImage = (imagePath) => {
  if (!imagePath) return "";
  return /^https?:\/\//i.test(imagePath) ? imagePath : storageUrl(imagePath);
};
const formatChoice = (options, value) =>
  options.find((option) => option.value === value)?.label || "—";

export const Menus = () => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    menu_type: "regular",
    availability_type: "all_day",
    start_time: "",
    end_time: "",
    available_days: [],
    start_date: "",
    end_date: "",
    service_types: ["dine_in"],
    display_order: "0",
    is_active: true,
    description: "",
  });

  const [showAddMenus, setShowAddMenus] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [Menus, setMenus] = useState([]);
  const [isMenusLoading, setIsMenusLoading] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [isDeletingMenu, setIsDeletingMenu] = useState(false);
  const [editingMenus, setEditingMenus] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewMenus, setShowViewMenus] = useState(false);
  const [viewMenus, setViewMenus] = useState(null);
  const [assignMenu, setAssignMenu] = useState(null);
  const [showAssignItems, setShowAssignItems] = useState(false);
  const [assignItemsToAllBranches, setAssignItemsToAllBranches] =
    useState(false);
  const [assignmentOptions, setAssignmentOptions] = useState([]);
  const [assignedItemIds, setAssignedItemIds] = useState([]);
  const [showAssignBranches, setShowAssignBranches] = useState(false);
  const [branchAssignMenu, setBranchAssignMenu] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [assignedBranchIds, setAssignedBranchIds] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isSavingBranches, setIsSavingBranches] = useState(false);
  const [branchAssignmentError, setBranchAssignmentError] = useState("");
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  const updateAvailability = async (menu) => {
    try {
      await api.patch(`/menus/${menu.id}/availability`, {
        is_active: menu.branch_availability !== true,
      });
      await fetchMenus();
    } catch (error) {
      console.error("Unable to update menu availability", error);
    }
  };

  const fetchMenus = async () => {
    setIsMenusLoading(true);
    try {
      const response = await api.get("/menus");
      console.log("Fetched menus:", response);
      const menuData = response.data.data.map((menus) => ({
        id: menus.id,
        name: menus.name,
        description: menus.description,
        branches: menus.branches || [],
        branch_availability: menus.branch_availability,
        availability_label: (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
              menus.branch_availability === true
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                : menus.branch_availability === false
                  ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30"
                  : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30"
            }`}
          >
            {menus.branch_availability === true
              ? "Available"
              : menus.branch_availability === false
                ? "Unavailable"
                : "Not assigned"}
          </span>
        ),
        menu_item_count: menus.branch_menu_item_count ?? 0,
        display_order: menus.display_order,
        code: menus.code || "",
        menu_type: menus.menu_type,
        availability_type: menus.availability_type,
        start_time: menus.start_time?.slice(0, 5) || "",
        end_time: menus.end_time?.slice(0, 5) || "",
        available_days: menus.available_days || [],
        start_date: menus.start_date || "",
        end_date: menus.end_date || "",
        service_types: menus.service_types || [],
        active_label: menus.is_active ? "Active" : "Inactive",
        menu_type_label: formatChoice(menuTypeOptions, menus.menu_type),
        availability_type_label: formatChoice(
          availabilityTypeOptions,
          menus.availability_type,
        ),
        service_types_label: (menus.service_types || [])
          .map((type) => formatChoice(serviceTypeOptions, type))
          .join(", "),
        schedule_label:
          menus.availability_type === "scheduled"
            ? `${menus.start_time?.slice(0, 5) || "?"}–${menus.end_time?.slice(0, 5) || "?"} · ${(menus.available_days || []).map((day) => formatChoice(availableDayOptions, day)).join(", ")}`
            : formatChoice(availabilityTypeOptions, menus.availability_type),
        date_range:
          [menus.start_date, menus.end_date].filter(Boolean).join(" – ") || "—",
      }));
      menuData.sort((a, b) => {
        const availabilityOrder = (value) =>
          value === true ? 0 : value === false ? 1 : 2;
        return (
          availabilityOrder(a.branch_availability) -
          availabilityOrder(b.branch_availability)
        );
      });
      setMenus(menuData);
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setIsMenusLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const openAssignItems = async (menu) => {
    setAssignMenu(menu);
    setAssignItemsToAllBranches(false);
    setAssignedItemIds([]);
    setAssignmentOptions([]);
    setAssignmentError("");
    setShowAssignItems(true);
    setIsLoadingAssignments(true);
    try {
      const { data } = await api.get(`/menus/${menu.id}/items`);
      const availableItems = data.available_items ?? [];
      const assignedItems = data.assigned_items ?? [];
      const optionItems = [
        ...availableItems,
        ...assignedItems.filter(
          (item) =>
            !availableItems.some((available) => available.id === item.id),
        ),
      ];
      setAssignMenu({
        ...menu,
        details: data.menu,
        branch_name: data.branch_name,
      });
      setAssignmentOptions(
        optionItems.map((item) => ({
          value: String(item.id),
          label: item.name,
          image: item.image_path || item.image,
        })),
      );
      setAssignedItemIds(assignedItems.map((item) => String(item.id)));
    } catch (error) {
      setAssignmentError(
        error.response?.data?.message || "Could not load branch menu items.",
      );
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const saveAssignedItems = async () => {
    if (!assignMenu) return;
    setIsSavingAssignments(true);
    setAssignmentError("");
    try {
      await api.put(`/menus/${assignMenu.id}/items`, {
        menu_item_ids: assignedItemIds.map(Number),
        all_branches: assignItemsToAllBranches,
      });
      setShowAssignItems(false);
      setAssignMenu(null);
      await fetchMenus();
    } catch (error) {
      setAssignmentError(
        Object.values(error.response?.data?.errors ?? {}).flat()[0] ||
          error.response?.data?.message ||
          "Could not save menu item assignments.",
      );
    } finally {
      setIsSavingAssignments(false);
    }
  };

  const openAssignBranches = async (menu) => {
    setBranchAssignMenu(menu);
    setBranchOptions([]);
    setAssignedBranchIds([]);
    setBranchAssignmentError("");
    setShowAssignBranches(true);
    setIsLoadingBranches(true);

    try {
      const [branchResponse, menuResponse] = await Promise.all([
        api.get("/branches?per_page=1000"),
        api.get(`/menus/${menu.id}`),
      ]);
      const branches = branchResponse.data.data.data ?? [];
      const currentMenu = menuResponse.data.data;
      setBranchAssignMenu({ ...menu, details: currentMenu });
      setBranchOptions(
        branches.map((branch) => ({
          value: String(branch.id),
          label: branch.name,
        })),
      );
      setAssignedBranchIds(
        (currentMenu.branches ?? []).map((branch) => String(branch.id)),
      );
    } catch (error) {
      setBranchAssignmentError(
        error.response?.data?.message || "Could not load branches.",
      );
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const saveAssignedBranches = async () => {
    if (!branchAssignMenu) return;

    setIsSavingBranches(true);
    setBranchAssignmentError("");
    try {
      await api.put(`/menus/${branchAssignMenu.id}/branches`, {
        branch_ids: assignedBranchIds.map(Number),
      });
      setShowAssignBranches(false);
      setBranchAssignMenu(null);
      await fetchMenus();
    } catch (error) {
      setBranchAssignmentError(
        Object.values(error.response?.data?.errors ?? {}).flat()[0] ||
          error.response?.data?.message ||
          "Could not save branch assignments.",
      );
    } finally {
      setIsSavingBranches(false);
    }
  };

  const columns = [
    { key: "code", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "menu_type_label", label: "Menu type", sortable: true },
    { key: "availability_label", label: "Availability" },
    { key: "menu_item_count", label: "Items" },
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
        menu_type: menu.menu_type || "regular",
        availability_type: menu.availability_type || "all_day",
        start_time: menu.start_time?.slice(0, 5) || "",
        end_time: menu.end_time?.slice(0, 5) || "",
        available_days: menu.available_days || [],
        start_date: menu.start_date || "",
        end_date: menu.end_date || "",
        service_types: menu.service_types || [],
        description: menu.description || "",
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
    if (!formData.service_types.length)
      errors.service_types = "Select at least one service type.";
    if (formData.availability_type === "scheduled") {
      if (!formData.start_time)
        errors.start_time = "Start time is required for scheduled menus.";
      if (!formData.end_time)
        errors.end_time = "End time is required for scheduled menus.";
      if (
        formData.start_time &&
        formData.end_time &&
        formData.end_time <= formData.start_time
      )
        errors.end_time = "End time must be later than start time.";
      if (!formData.available_days.length)
        errors.available_days = "Select at least one available day.";
    }
    if (
      formData.start_date &&
      formData.end_date &&
      formData.end_date < formData.start_date
    )
      errors.end_date = "End date must be on or after start date.";

    setFieldErrors(errors);
    console.log(errors);
    return Object.keys(errors).length === 0;
  };

  const resetAddMenusForm = () => {
    setFormData({
      name: "",
      code: "",
      menu_type: "regular",
      availability_type: "all_day",
      start_time: "",
      end_time: "",
      available_days: [],
      start_date: "",
      end_date: "",
      service_types: ["dine_in"],
      description: "",
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
      menu_type: formData.menu_type,
      availability_type: formData.availability_type,
      start_time:
        formData.availability_type === "scheduled" ? formData.start_time : null,
      end_time:
        formData.availability_type === "scheduled" ? formData.end_time : null,
      available_days:
        formData.availability_type === "scheduled"
          ? formData.available_days
          : [],
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      service_types: formData.service_types,
      description: formData.description,
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
        menu_type: errors.menu_type?.[0],
        availability_type: errors.availability_type?.[0],
        service_types:
          errors.service_types?.[0] || errors["service_types.0"]?.[0],
        start_time: errors.start_time?.[0],
        end_time: errors.end_time?.[0],
        available_days:
          errors.available_days?.[0] || errors["available_days.0"]?.[0],
        end_date: errors.end_date?.[0],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenus = (row) => {
    setMenuToDelete(row);
  };

  const confirmDeleteMenu = async () => {
    if (!menuToDelete) return;

    setIsDeletingMenu(true);
    try {
      await api.delete(`/menus/${menuToDelete.id}`);
      await fetchMenus();
      setMenuToDelete(null);
      console.log("Menus deleted successfully.");
    } catch (error) {
      console.error("Failed to delete menus:", error);
    } finally {
      setIsDeletingMenu(false);
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                setFormData({
                  ...formData,
                  code: e.target.value.toUpperCase(),
                });
                setFieldError("code", "");
              }}
              helperText={fieldErrors.code || ""}
              error={!!fieldErrors.code}
            />
            <SelectField
              label="Menu type"
              required
              fullWidth
              value={formData.menu_type}
              options={menuTypeOptions}
              onChange={(e) =>
                setFormData({ ...formData, menu_type: e.target.value })
              }
              error={!!fieldErrors.menu_type}
              helperText={fieldErrors.menu_type}
            />
            <SelectField
              label="Availability type"
              required
              fullWidth
              value={formData.availability_type}
              options={availabilityTypeOptions}
              onChange={(e) => {
                const availability_type = e.target.value;
                setFormData({
                  ...formData,
                  availability_type,
                  ...(availability_type === "scheduled"
                    ? {}
                    : { start_time: "", end_time: "", available_days: [] }),
                });
                setFieldError("start_time", "");
                setFieldError("end_time", "");
                setFieldError("available_days", "");
              }}
              error={!!fieldErrors.availability_type}
              helperText={fieldErrors.availability_type}
            />
            {formData.availability_type === "scheduled" && (
              <>
                <TextField
                  floatLabel={true}
                  label="Start time"
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  error={!!fieldErrors.start_time}
                  helperText={fieldErrors.start_time}
                />
                <TextField
                  floatLabel={true}
                  label="End time"
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  error={!!fieldErrors.end_time}
                  helperText={fieldErrors.end_time}
                />
                <SelectField
                  label="Available days"
                  required
                  fullWidth
                  multiple
                  searchable
                  selectAllOption
                  selectAllLabel="Select all days"
                  value={formData.available_days}
                  options={availableDayOptions}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      available_days: e.target.value,
                    });
                    setFieldError("available_days", "");
                  }}
                  error={!!fieldErrors.available_days}
                  helperText={fieldErrors.available_days}
                />
              </>
            )}
            <TextField
              floatLabel={true}
              label="Start date (optional)"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />
            <TextField
              floatLabel={true}
              label="End date (optional)"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              error={!!fieldErrors.end_date}
              helperText={fieldErrors.end_date}
            />
            <SelectField
              label="Service types"
              required
              fullWidth
              multiple
              value={formData.service_types}
              options={serviceTypeOptions}
              onChange={(e) => {
                setFormData({ ...formData, service_types: e.target.value });
                setFieldError("service_types", "");
              }}
              error={!!fieldErrors.service_types}
              helperText={fieldErrors.service_types}
            />
            <SelectField
              label="Status"
              required
              fullWidth
              value={formData.is_active ? "active" : "inactive"}
              options={menuStatusOptions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.value === "active",
                })
              }
            />
            <TextAreaField
              label="Description"
              fullWidth
              className="sm:col-span-2"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
              }}
              rows={2}
              resize="vertical"
              maxLength={100}
            />
          </div>
        </Dialog>
      </div>
      <div className="mt-4">
        <Table
          columns={columns}
          data={Menus}
          selectable={false}
          expandable={false}
          searchable={true}
          filterable={false}
          pagination={true}
          loading={isMenusLoading}
          actions={(row) => [
            {
              label: "Menu actions",
              render: () => (
                <ActionMenu
                  label={`Actions for ${row.name}`}
                  menuClassName="whitespace-nowrap"
                  items={[
                    { label: "Edit menu", onClick: () => handleEditMenus(row) },
                    { label: "View menu", onClick: () => handleViewMenus(row) },
                    {
                      label: "Assign items",
                      onClick: () => openAssignItems(row),
                    },
                    {
                      label: "Assign branches",
                      onClick: () => openAssignBranches(row),
                    },
                    {
                      label:
                        row.branch_availability === true
                          ? "Set unavailable"
                          : "Set available",
                      onClick: () => updateAvailability(row),
                    },
                    {
                      label: "Delete menu",
                      variant: "danger",
                      onClick: () => handleDeleteMenus(row),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>

      <Dialog
        isOpen={!!menuToDelete}
        onClose={() => !isDeletingMenu && setMenuToDelete(null)}
        title="Delete menu?"
        size="small"
        primaryButtonText={isDeletingMenu ? "Deleting..." : "Delete"}
        primaryButtonDisabled={isDeletingMenu}
        secondaryButtonText="Cancel"
        secondaryButtonDisabled={isDeletingMenu}
        onPrimaryButtonClick={confirmDeleteMenu}
        onSecondaryButtonClick={() => setMenuToDelete(null)}
      >
        <p className="text-sm text-slate-600 dark:text-[#A0A6B0]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900 dark:text-[#F7F8F8]">
            {menuToDelete?.name}
          </span>
          ? This action cannot be undone.
        </p>
      </Dialog>

      <Dialog
        isOpen={showAssignBranches}
        onClose={() => setShowAssignBranches(false)}
        title="Assign Branches"
        size="medium"
        primaryButtonText={isSavingBranches ? "Saving..." : "Save"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isSavingBranches || isLoadingBranches}
        secondaryButtonDisabled={isSavingBranches}
        onPrimaryButtonClick={saveAssignedBranches}
        onSecondaryButtonClick={() => setShowAssignBranches(false)}
      >
        {branchAssignMenu && (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#30343A] dark:bg-[#161719] sm:grid-cols-2">
              <DetailItem
                label="Menu"
                value={branchAssignMenu.details?.name || branchAssignMenu.name}
              />
              <DetailItem
                label="Code"
                value={branchAssignMenu.details?.code || branchAssignMenu.code}
              />
            </div>
            {isLoadingBranches ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading branches...
              </p>
            ) : (
              <ImageSelectListField
                label="Branches assigned to this menu"
                options={branchOptions}
                value={assignedBranchIds}
                onChange={setAssignedBranchIds}
                addLabel="Add branch"
                addAllLabel="Add all branches"
                emptyMessage="No branches are assigned to this menu."
              />
            )}
            {branchAssignmentError && (
              <p
                role="alert"
                className="text-sm text-rose-600 dark:text-rose-400"
              >
                {branchAssignmentError}
              </p>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={showAssignItems}
        onClose={() => setShowAssignItems(false)}
        title="Assign Menu Items"
        size="medium"
        primaryButtonText={isSavingAssignments ? "Saving..." : "Save"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isSavingAssignments || isLoadingAssignments}
        secondaryButtonDisabled={isSavingAssignments}
        onPrimaryButtonClick={saveAssignedItems}
        onSecondaryButtonClick={() => setShowAssignItems(false)}
      >
        {assignMenu && (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#30343A] dark:bg-[#161719] sm:grid-cols-3">
              <DetailItem
                label="Menu"
                value={assignMenu.details?.name || assignMenu.name}
              />
              <DetailItem
                label="Code"
                value={assignMenu.details?.code || assignMenu.code}
              />
              <DetailItem
                label="Branch"
                value={assignMenu.branch_name || "Logged-in branch"}
              />
            </div>
            {isLoadingAssignments ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading branch menu items...
              </p>
            ) : (
              <>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-[#30343A] dark:bg-[#161719]">
                  <input
                    type="checkbox"
                    checked={assignItemsToAllBranches}
                    onChange={(event) =>
                      setAssignItemsToAllBranches(event.target.checked)
                    }
                    disabled={isSavingAssignments}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-[#454A52] dark:bg-[#121314]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-[#D0D6E0]">
                      Apply these items to all assigned branches
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-[#8A8F98]">
                      When enabled, saving replaces the item list for every
                      branch assigned to this menu. Selected items must be
                      available at each branch.
                    </span>
                  </span>
                </label>
                <ImageSelectListField
                  label="Items assigned to this menu at this branch"
                  options={assignmentOptions}
                  value={assignedItemIds}
                  onChange={setAssignedItemIds}
                  addLabel="Add item"
                  emptyMessage="No items are assigned to this menu at this branch."
                />
              </>
            )}
            {assignmentError && (
              <p
                role="alert"
                className="text-sm text-rose-600 dark:text-rose-400"
              >
                {assignmentError}
              </p>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={showViewMenus}
        onClose={() => setShowViewMenus(false)}
        title="Menu Profile"
        size="large"
        showFooter={false}
      >
        {viewMenus && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-[#1F2226] dark:from-[#161719] dark:to-[#121314]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#8A8F98]">
                    {viewMenus.code || "Menu"}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-gray-950 dark:text-[#F7F8F8]">
                    {viewMenus.name || "Untitled menu"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#8A8F98]">
                    {formatChoice(menuTypeOptions, viewMenus.menu_type)} menu
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${viewMenus.is_active ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30" : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30"}`}
                  >
                    {viewMenus.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30">
                    {(viewMenus.menu_items || viewMenus.menuItems || []).length}{" "}
                    items here
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setShowViewMenus(false);
                    openAssignItems({
                      id: viewMenus.id,
                      name: viewMenus.name,
                      code: viewMenus.code,
                    });
                  }}
                >
                  Manage items
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setShowViewMenus(false);
                    openAssignBranches({
                      id: viewMenus.id,
                      name: viewMenus.name,
                      code: viewMenus.code,
                    });
                  }}
                >
                  Manage branches
                </Button>
              </div>
            </div>

            <section className="rounded-xl border border-slate-200 p-4 dark:border-[#1F2226]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-[#F7F8F8]">
                    Assigned branches
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8A8F98]">
                    Availability is managed separately for each branch.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-[#1A1C20] dark:text-[#A0A6B0]">
                  {(viewMenus.branches || []).length}
                </span>
              </div>
              {(viewMenus.branches || []).length ? (
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {viewMenus.branches.map((branch) => (
                    <li
                      key={branch.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 dark:border-[#30343A] dark:bg-[#161719]"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-slate-800 dark:text-[#D0D6E0]">
                        {branch.name}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${branch.pivot?.is_active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"}`}
                      >
                        {branch.pivot?.is_active ? "Available" : "Unavailable"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-[#30343A] dark:text-[#8A8F98]">
                  No branches assigned yet.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 p-4 dark:border-[#1F2226]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-[#F7F8F8]">
                    Menu items
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8A8F98]">
                    Items assigned at the logged-in branch.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-[#1A1C20] dark:text-[#A0A6B0]">
                  {(viewMenus.menu_items || viewMenus.menuItems || []).length}
                </span>
              </div>
              {(viewMenus.menu_items || viewMenus.menuItems || []).length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {(viewMenus.menu_items || viewMenus.menuItems || []).map(
                    (item) => {
                      const primaryImage =
                        item.images?.find((image) => image.is_primary) ||
                        item.images?.[0];
                      const imageUrl = resolveMenuImage(
                        primaryImage?.image_path || item.image_path,
                      );
                      return (
                        <li
                          key={item.id}
                          className="group flex min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-md dark:border-[#30343A] dark:bg-[#161719] dark:hover:border-[#5E6AD2]"
                        >
                          <div className="h-28 w-28 shrink-0 overflow-hidden bg-slate-100 dark:bg-[#1A1C20]">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={primaryImage?.alt_text || item.name}
                                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center px-2 text-center text-xs text-slate-400">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-center p-3">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-[#F7F8F8]">
                              {item.name}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500 dark:text-[#8A8F98]">
                              {item.sku || "Menu item"}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                              Rs. {Number(item.base_price || 0).toFixed(2)}
                            </p>
                          </div>
                        </li>
                      );
                    },
                  )}
                </ul>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 dark:border-[#30343A] dark:text-[#8A8F98]">
                  No items assigned at the logged-in branch.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 p-4 dark:border-[#1F2226]">
              <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-[#F7F8F8]">
                Menu details
              </h4>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <DetailItem
                  label="Availability type"
                  value={formatChoice(
                    availabilityTypeOptions,
                    viewMenus.availability_type,
                  )}
                />
                <DetailItem
                  label="Service types"
                  value={(viewMenus.service_types || [])
                    .map((type) => formatChoice(serviceTypeOptions, type))
                    .join(", ")}
                />
                {viewMenus.availability_type === "scheduled" && (
                  <>
                    <DetailItem
                      label="Start time"
                      value={viewMenus.start_time?.slice(0, 5)}
                    />
                    <DetailItem
                      label="End time"
                      value={viewMenus.end_time?.slice(0, 5)}
                    />
                    <DetailItem
                      label="Available days"
                      value={(viewMenus.available_days || [])
                        .map((day) => formatChoice(availableDayOptions, day))
                        .join(", ")}
                      wide
                    />
                  </>
                )}
                <DetailItem label="Start date" value={viewMenus.start_date} />
                <DetailItem label="End date" value={viewMenus.end_date} />
                <DetailItem
                  label="Description"
                  value={viewMenus.description}
                  wide
                />
              </div>
            </section>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Menus;
