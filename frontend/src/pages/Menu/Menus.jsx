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
    Menu_name: "",
    branch: "",
    statusOption: "active",
    description: "",
  });

  const [showAddMenus, setShowAddMenus] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [Menus, setMenus] = useState([]);
  const [editingMenus, setEditingMenus] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewMenus, setShowViewMenus] = useState(false);
  const [viewMenus, setViewMenus] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    api.get("/branches").then((response) => {
      const branchesData = response.data.data.data;
      console.log(branchesData);
      const formattedBranches = branchesData.map((branch) => ({
        value: branch.id,
        label: branch.name,
      }));
      setBranches(formattedBranches);
    });
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await api.get("/menus");
      console.log("Fetched menus:", response);
      const menuData = response.data.data.map((menus) => ({
        id: menus.id,
        name: menus.name,
        description: menus.description,
        branch: menus.branch.name,
        statusOption: menus.status
          ? menus.status.charAt(0).toUpperCase() + menus.status.slice(1)
          : "N/A",
      }));
      setMenus(menuData);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const status = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "branch", label: "Branch", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "statusOption", label: "Status" },
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
        description: menu.description || "",
        branch: menu.branch_id || "",
        statusOption: menu.status || "active",
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
      branch: "",
      statusOption: "active",
    });
    setFieldErrors({});
  };

  const handleCloseAddMenus = () => {
    resetAddMenusForm();
    setShowAddMenus(false);
    setIsEditMode(false);
    setEditingMenus(null);
  };

  const handleSubmitMenus = () => {
    console.log(fieldErrors);
    if (!validateSubmit()) return;

    setIsSubmitting(true);

    const menus = {
      name: formData.name,
      description: formData.description,
      branch: formData.branch,
      status: formData.statusOption,
    };

    console.log("Submitted menus:", menus);
    if (isEditMode) {
      console.log("Editing menus with ID:", editingMenus.id);
      api.put(`/menus/${editingMenus.id}`, menus);
    } else {
      api.post("/menus", menus);
    }

    setIsSubmitting(false);
    setIsEditMode(false);
    resetAddMenusForm();
    fetchMenus();
    setShowAddMenus(false);
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
          Menus
        </h1>

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
              required
              fullwidth={true}
              label="Select Branch"
              value={formData.branch}
              options={branches}
              onChange={(e) => {
                setFormData({ ...formData, branch: e.target.value });
                setFieldError("branch", "");
              }}
              helperText={fieldErrors.branch || ""}
              error={!!fieldErrors.branch}
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
                <SelectField
                  label="Branch"
                  value={formData.branch}
                  options={branches}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
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
          <div className="space-y-6">
            <div className="rounded border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-[#202024]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">
                    {`${viewMenus.name || ""}`.trim() || "Not provided"}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                    {viewMenus.status || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Menu Details
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Name" value={viewMenus.name} />
                <DetailItem label="Status" value={viewMenus.status} />
                <DetailItem label="Branch" value={viewMenus.branch} />
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
