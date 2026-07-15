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
import { MenuItemCardList } from "../../components/MenuItemCardList";

export const MenuItems = () => {
  const [formData, setFormData] = useState({
    MenuItem_name: "",
    MenuCategory: "",
    slug: "",
    short_description: "",
    long_description: "",
    price: "",
    sku: "",
    preperationTime: "",
    statusOption: "active",
    display_order: "",
  });

  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [MenuItems, setMenuItems] = useState([]);
  const [editingMenuItems, setEditingMenuItems] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewMenuItems, setShowViewMenuItems] = useState(false);
  const [viewMenuItems, setViewMenuItems] = useState(null);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get("/menuItems");
      console.log("Fetched menuItems:", response);
      const menuData = response.data.data.map((menuItems) => ({
        id: menuItems.id,
        name: menuItems.name,
        slug: menuItems.slug,
        long_description: menuItems.long_description,
        short_description: menuItems.short_description,
        price: menuItems.base_price,
        sku: menuItems.sku,
        preperationTime: menuItems.preperation_time,
        display_order: menuItems.display_order,
        statusOption: menuItems.status
          ? menuItems.status.charAt(0).toUpperCase() + menuItems.status.slice(1)
          : "N/A",
      }));
      setMenuItems(menuData);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const status = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  const columns = [
    { key: "sku", label: "SKU", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "short_description", label: "Short Description", sortable: true },
    { key: "price", label: "Price", sortable: true },
    { key: "statusOption", label: "Status" },
  ];

  const handleEditMenuItems = async (row) => {
    try {
      console.log("Editing menu with ID:", row.id);
      const response = await api.get(`/menuItems/${row.id}`);
      const menuItem = response.data.data;

      setEditingMenuItems(menuItem);
      setIsEditMode(true);

      setFormData({
        id: menuItem.id,
        name: menuItem.name,
        slug: menuItem.slug,
        long_description: menuItem.long_description,
        short_description: menuItem.short_description,
        price: menuItem.base_price,
        sku: menuItem.sku,
        preperationTime: menuItem.preperation_time,
        display_order: menuItem.display_order,
        statusOption: menuItem.status || "active",
      });

      setShowAddMenuItems(true);
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

    setFieldErrors(errors);
    console.log(errors);
    return Object.keys(errors).length === 0;
  };

  const resetAddMenusForm = () => {
    setFormData({
      name: "",
      description: "",
      id: "",
      slug: "",
      long_description: "",
      short_description: "",
      price: "",
      sku: "",
      preperationTime: "",
      display_order: "",
      statusOption: "active",
    });
    setFieldErrors({});
  };

  const handleCloseAddMenuItems = () => {
    resetAddMenuItemsForm();
    setShowAddMenuItems(false);
    setIsEditMode(false);
    setEditingMenuItems(null);
  };

  const handleSubmitMenuItems = () => {
    console.log(fieldErrors);
    if (!validateSubmit()) return;

    setIsSubmitting(true);

    const menuItem = {
      id: formData.id,
      name: formData.name,
      slug: formData.slug,
      long_description: formData.long_description,
      short_description: formData.short_description,
      price: formData.price,
      sku: formData.sku,
      preperationTime: formData.preperationTime,
      display_order: formData.display_order,
      status: formData.statusOption,
    };

    console.log("Submitted menu items:", menuItem);
    if (isEditMode) {
      console.log("Editing menu items with ID:", editingMenuItems.id);
      api.put(`/menuItems/${editingMenuItems.id}`, menuItem);
    } else {
      api.post("/menuItems", menuItem);
    }

    setIsSubmitting(false);
    setIsEditMode(false);
    resetAddMenuItemsForm();
    fetchMenuItems();
    setShowAddMenuItems(false);
  };

  const handleDeleteMenuItems = async (row) => {
    try {
      await api.delete(`/menuItems/${row.id}`);

      //      const user = response.data.data;

      // Refresh the table
      fetchMenuItems();

      console.log("Menu items deleted successfully.");
    } catch (error) {
      console.error("Failed to delete menu items:", error);
    }
  };

  const handleViewMenuItems = async (row) => {
    try {
      const response = await api.get(`/menuItems/${row.id}`);

      setViewMenuItems(response.data.data);
      setShowViewMenuItems(true);
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
          Menu Items
        </h1>

        <Button
          variant="primary"
          onClick={() => {
            resetAddMenuItemsForm();
            setShowAddMenuItems(true);
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
          Add Menu Items
        </Button>
        <Dialog
          isOpen={showAddMenuItem}
          onClose={handleCloseAddMenuItems}
          title={isEditMode ? "Edit Menu Items" : "Add Menu Items"}
          size="medium"
          primaryButtonText={
            isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"
          }
          secondaryButtonText="Cancel"
          primaryButtonDisabled={isSubmitting}
          secondaryButtonDisabled={isSubmitting}
          onPrimaryButtonClick={handleSubmitMenuItems}
          onSecondaryButtonClick={handleCloseAddMenuItems}
        >
          <div className="space-y-6 mb-4">
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
          data={MenuItems}
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
              onClick: handleEditMenuItems,
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
              onClick: handleDeleteMenuItems,
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
              onClick: handleViewMenuItems,
            },
          ]}
        />
      </div>

      <Dialog
        isOpen={showViewMenuItems}
        onClose={() => setShowViewMenuItems(false)}
        title="Menu Item Profile"
        size="medium"
        showFooter={false}
      >
        {viewMenuItems && (
          <div className="space-y-6">
            <div className="rounded border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-[#202024]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">
                    {`${viewMenuItems.name || ""}`.trim() || "Not provided"}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                    {viewMenuItems.status || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Menu Item Details
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Name" value={viewMenuItems.name} />
                <DetailItem label="Status" value={viewMenuItems.status} />
                <DetailItem label="Price" value={viewMenuItems.base_price} />
                <DetailItem label="SKU" value={viewMenuItems.sku} />
                <DetailItem
                  label="Preparation Time"
                  value={viewMenuItems.preperation_time}
                />
                <DetailItem
                  label="Display Order"
                  value={viewMenuItems.display_order}
                />
              </div>
              <div className="mt-4"></div>
              <DetailItem
                label="Description"
                value={viewMenuItems.description}
              />
            </div>
          </div>
        )}
      </Dialog>

      <MenuItemCardList
        items={MenuItems}
        columns={3}
        currency="USD"
        onView={(item) => console.log("View", item)}
        onEdit={(item) => console.log("Edit", item)}
        onDelete={(item) => console.log("Delete", item)}
      />
    </div>
  );
};

export default MenuItems;
