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

export const MenuCategories = () => {
  const [formData, setFormData] = useState({
    MenuCategory_name: "",
    image: null,
    display_order: "",
    statusOption: "active",
    description: "",
  });

  const [showAddMenuCategories, setShowAddMenuCategories] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [MenuCategories, setMenuCategories] = useState([]);
  const [editingMenuCategories, setEditingMenuCategories] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewMenuCategories, setShowViewMenuCategories] = useState(false);
  const [viewMenuCategories, setViewMenuCategories] = useState(null);

  const fetchMenuCategories = async () => {
    try {
      const response = await api.get("/menu-categories");
      console.log("Fetched menu categories:", response);
      const menuData = response.data.data.map((menuCategory) => ({
        id: menuCategory.id,
        name: menuCategory.name,
        image: menuCategory.image,
        display_order: menuCategory.display_order,
        description: menuCategory.description,
        statusOption: menuCategory.status
          ? menuCategory.status.charAt(0).toUpperCase() +
            menuCategory.status.slice(1)
          : "N/A",
      }));
      setMenuCategories(menuData);
    } catch (error) {
      console.error("Error fetching menu categories:", error);
    }
  };

  useEffect(() => {
    fetchMenuCategories();
  }, []);

  const status = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "image", label: "Image", sortable: false },
    { key: "description", label: "Description", sortable: true },
    { key: "display_order", label: "Display Order", sortable: true },
    { key: "statusOption", label: "Status" },
  ];

  const handleEditMenuCategories = async (row) => {
    try {
      console.log("Editing menu category with ID:", row.id);
      const response = await api.get(`/menu-categories/${row.id}`);
      const menuCategory = response.data.data;

      setEditingMenuCategories(menuCategory);
      setIsEditMode(true);

      setFormData({
        id: menuCategory.id,
        name: menuCategory.name || "",
        description: menuCategory.description || "",
        image: menuCategory.image || null,
        display_order: menuCategory.display_order || "",
        statusOption: menuCategory.status || "active",
      });

      setShowAddMenuCategories(true);
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
    if (!(formData.description || "").trim())
      errors.description = "Description is required.";
    if (!(formData.display_order || "").trim())
      errors.display_order = "Display order is required.";
    if (!(formData.image || "")) errors.image = "Image is required.";

    setFieldErrors(errors);
    console.log(errors);
    return Object.keys(errors).length === 0;
  };

  const resetAddMenuCategoriesForm = () => {
    setFormData({
      name: "",
      description: "",
      image: null,
      display_order: "",
      statusOption: "active",
    });
    setFieldErrors({});
  };

  const handleCloseAddMenuCategories = () => {
    resetAddMenuCategoriesForm();
    setShowAddMenuCategories(false);
    setIsEditMode(false);
    setEditingMenuCategories(null);
  };

  const handleSubmitMenuCategories = () => {
    console.log(fieldErrors);
    if (!validateSubmit()) return;

    setIsSubmitting(true);

    const menuCategory = {
      name: formData.name,
      description: formData.description,
      image: formData.image,
      display_order: formData.display_order,
      status: formData.statusOption,
    };

    console.log("Submitted menu categories:", menuCategory);
    if (isEditMode) {
      console.log("Editing menu categories with ID:", editingMenuCategories.id);
      api.put(`/menu-categories/${editingMenuCategories.id}`, menuCategory);
    } else {
      api.post("/menu-categories", menuCategory);
    }

    setIsSubmitting(false);
    setIsEditMode(false);
    resetAddMenuCategoriesForm();
    fetchMenuCategories();
    setShowAddMenuCategories(false);
  };

  const handleDeleteMenuCategories = async (row) => {
    try {
      await api.delete(`/menu-categories/${row.id}`);

      //      const user = response.data.data;

      // Refresh the table
      fetchMenuCategories();

      console.log("Menu categories deleted successfully.");
    } catch (error) {
      console.error("Failed to delete menu categories:", error);
    }
  };

  const handleViewMenuCategories = async (row) => {
    try {
      const response = await api.get(`/menu-categories/${row.id}`);

      setViewMenuCategories(response.data.data);
      setShowViewMenuCategories(true);
    } catch (error) {
      console.error(error);
    }
  };

  const DetailItem = ({ label, value, wide = false }) => (
    <div
      className={`rounded border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-[#202024] ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-gray-100">
        {value || "Not provided"}
      </p>
    </div>
  );
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Menu Categories
        </h1>

        <Button
          variant="primary"
          onClick={() => {
            resetAddMenuCategoriesForm();
            setShowAddMenuCategories(true);
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
          Add Menu Categories
        </Button>
        <Dialog
          isOpen={showAddMenuCategories}
          onClose={handleCloseAddMenuCategories}
          title={isEditMode ? "Edit Menu Categories" : "Add Menu Categories"}
          size="medium"
          primaryButtonText={
            isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"
          }
          secondaryButtonText="Cancel"
          primaryButtonDisabled={isSubmitting}
          secondaryButtonDisabled={isSubmitting}
          onPrimaryButtonClick={handleSubmitMenuCategories}
          onSecondaryButtonClick={handleCloseAddMenuCategories}
        >
          <div className="space-y-6 mb-4">
            <ImageUploadField
              label="Category Image"
              value={formData.image}
              onChange={(e) => {
                setFormData({ ...formData, image: e.target.value });
              }}
            />
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
          </div>
          <div className="space-y-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              required
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => {
                setFormData({ ...formData, displayOrder: e.target.value });
                setFieldError("displayOrder", "");
              }}
              helperText={fieldErrors.displayOrder || ""}
              error={!!fieldErrors.displayOrder}
            />
            <SelectField
              fullwidth={true}
              label="Status"
              value={formData.statusOption}
              options={status}
              onChange={(e) => {
                setFormData({ ...formData, statusOption: e.target.value });
              }}
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
              <div className="flex  gap-4 w-full">
                <SelectField
                  label="Status"
                  value={formData.statusOption}
                  options={status}
                  onChange={(e) =>
                    setFormData({ ...formData, statusOption: e.target.value })
                  }
                  fullWidth={true}
                />
                <TextField
                  required
                  label="Display Order"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => {
                    setFormData({ ...formData, displayOrder: e.target.value });
                    setFieldError("displayOrder", "");
                  }}
                  helperText={fieldErrors.displayOrder || ""}
                  error={!!fieldErrors.displayOrder}
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
          data={MenuCategories}
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
              onClick: handleEditMenuCategories,
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
              onClick: handleDeleteMenuCategories,
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
              onClick: handleViewMenuCategories,
            },
          ]}
        />
      </div>

      <Dialog
        isOpen={showViewMenuCategories}
        onClose={() => setShowViewMenuCategories(false)}
        title="Menu Category Profile"
        size="medium"
        showFooter={false}
      >
        {viewMenuCategories && (
          <div className="space-y-6">
            <div className="rounded border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-[#202024]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">
                    {`${viewMenuCategories.name || ""}`.trim() ||
                      "Not provided"}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                    {viewMenuCategories.status || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Menu Category Details
              </h4>
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 text-2xl font-semibold text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {viewMenuCategories.image ? (
                  <img
                    src={viewMenuCategories.image}
                    alt={viewMenuCategories.name || "Menu Category Image"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>
                    {(viewMenuCategories.name || viewMenuCategories.name || "U")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Name" value={viewMenuCategories.name} />
                <DetailItem label="Status" value={viewMenuCategories.status} />
                <DetailItem
                  label="Display Order"
                  value={viewMenuCategories.displayOrder}
                />
              </div>
              <div className="mt-4"></div>
              <DetailItem
                label="Description"
                value={viewMenuCategories.description}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default MenuCategories;
