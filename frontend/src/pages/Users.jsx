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
} from "../components/DataFields";
import { Table } from "../components/Tables";
import { Accordion } from "../components/Accordion";
import { Alert, Dialog, Snackbar, Loading, Drawer } from "../components/Popups";
import { SectionDivider, VerticalTabs } from "../components/SectionDivider";
import { Stepper } from "../components/Stepper";
import { AddItem } from "../components/AddItem";
import api from "../axiosClient";
import { storageUrl } from "../utils/storageUrl";

export const Users = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: "",
    uploadedImage: null,
    phone: "",
    whatsapp: "",
    dob: "",
    address: "",
    roleOption: "",
    branchOption: "",
    statusOption: "active",
    accessLevel: "5",
  });

  const [showAddUser, setShowAddUser] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isFormRole, setIsFormRole] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const status = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "blocked", label: "Blocked" },
  ];

  const accessLevels = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ];

  const columns = [
    { key: "profileImage", label: "Image" },
    { key: "fullname", label: "Full Name", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "branch", label: "Branch", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
  ];

  const pinRoles = ["cashier", "waiter"];

  const selectedRoleName =
    roles
      .find((role) => String(role.value) === String(formData.roleOption))
      ?.label?.toLowerCase() || "";

  const roleSelected = Boolean(formData.roleOption);
  const shouldShowPin = roleSelected && pinRoles.includes(selectedRoleName);
  const shouldValidatePin = pinRoles.includes(selectedRoleName);

  useEffect(() => {
    api.get("/roles").then((response) => {
      const rolesData = response.data.data;
      const formattedRoles = !isFormRole
        ? [{ value: "0", label: "All Roles" }]
        : "";
      formattedRoles.push(
        ...rolesData.map((role) => ({
          value: role.id,
          label: role.name,
        })),
      );

      console.log(formattedRoles);
      setRoles(formattedRoles);
    });
  }, []);

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

  const [filters, setFilters] = useState({
    role: "",
    branch: "",
    status: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users", {
        // params: {
        //   role: filters.role,
        //   branch: filters.branch,
        //   status: filters.status,
        // },
      });

      const usersData = response.data.data.map((user) => ({
        id: user.id,
        fullname: user.name,
        profileImage: user.profileImage,
        username: user.username,
        role: user.role ? user.role.name : "N/A",
        branch: user.branch ? user.branch.name : "N/A",
        phone: user.phone,
        email: user.email,
        status: user.status
          ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
          : "N/A",
      }));

      setUsers(usersData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditUser = async (row) => {
    try {
      const response = await api.get(`/users/${row.id}`);

      const user = response.data.data;

      setEditingUser(user);
      setIsEditMode(true);

      setFormData({
        id: user.id,
        fullname: user.name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        whatsapp: user.whatsapp || "",
        dob: user.dob || "",
        address: user.address || "",
        roleOption: user.role_id || "",
        branchOption: user.branch_id || "",
        statusOption: user.status || "Active",
        accessLevel: user.accessLevel || "5",
        uploadedImage: user.profileImage || null,
      });

      setShowAddUser(true);
    } catch (error) {
      console.error(error);
    }
  };

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

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

  const handleRoleChange = (value) => {
    setFormData({ ...formData, roleOption: value });

    setFormData({ ...formData, password: "", confirmPassword: "" });
    if (!pinRoles.includes(selectedRoleName)) {
      setFormData({ ...formData, pin: "", confirmPin: "" });
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.role;
      delete next.password;
      delete next.confirmPassword;
      delete next.pin;
      delete next.confirmPin;
      return next;
    });
  };

  const handleUsernameChange = (value) => {
    setFormData({ ...formData, username: value });

    // const usernameExists = data.some(
    //   (user) => user.username.toLowerCase() === value.trim().toLowerCase(),
    // );

    // if (usernameExists) {
    //   setFieldError("username", "Username already exists.");
    // } else {
    //   setFieldError("username", "");
    // }
  };

  const validateSubmit = () => {
    const errors = {};

    if (!formData.fullname.trim()) errors.fullname = "Full name is required.";
    if (!formData.username.trim()) errors.username = "Username is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.phone) errors.phone = "Phone number is required.";
    if (!formData.whatsapp) errors.whatsapp = "Whatsapp number is required.";
    if (!formData.roleOption) errors.role = "Role is required.";
    if (!formData.branchOption) errors.branch = "Branch is required.";

    const usernameExists = users.some(
      (user) =>
        user.id !== formData.id &&
        user.username.toLowerCase() === formData.username.trim().toLowerCase(),
    );

    const emailExists = users.some(
      (user) =>
        user.id !== formData.id &&
        user.email.toLowerCase() === formData.email.trim().toLowerCase(),
    );

    if (emailExists) {
      errors.email = "Email already exists.";
    }

    if (usernameExists) {
      errors.username = "Username already exists.";
    }

    if (!isEditMode) {
      if (shouldValidatePin) {
        if (formData.pin && !/^\d{4}$/.test(formData.pin)) {
          errors.pin = "PIN must be numeric and exactly 4 digits.";
        }

        if (formData.pin !== formData.confirmPin) {
          errors.confirmPin = "PIN and Confirm PIN must match.";
        }
      }

      if (!formData.password) {
        errors.password = "Password is required.";
      } else if (!passwordRegex.test(formData.password)) {
        errors.password =
          "Password must include uppercase, lowercase, number, symbol, and at least 8 characters.";
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "Confirm Password is required.";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Password and Confirm Password must match.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetAddUserForm = () => {
    setFormData({
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      pin: "",
      confirmPin: "",
      uploadedImage: null,
      phone: "",
      whatsapp: "",
      dob: "",
      address: "",
      roleOption: "",
      branchOption: "",
      statusOption: "active",
      accessLevel: "5",
    });
    setFieldErrors({});
  };

  const handleCloseAddUser = () => {
    setIsFormRole(false);
    resetAddUserForm();
    setShowAddUser(false);
    setIsEditMode(false);
    setEditingUser(null);
  };
  const handleSubmitUser = async () => {
    if (!validateSubmit()) return;

    setIsSubmitting(true);

    const user = {
      name: formData.fullname,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      dob: formData.dob,
      address: formData.address,
      role_id: formData.roleOption,
      branch_id: formData.branchOption,
      status: formData.statusOption,
      accessLevel: formData.accessLevel,
      profileImage: formData.uploadedImage,
      authType: shouldValidatePin ? "pin" : "password",
      password: formData.password,
    };

    console.log("Submitted user:", user);
    if (isEditMode) {
      console.log("Editing user with ID:", editingUser.id);
      await api.put(`/users/${editingUser.id}`, user);
    } else {
      await api.post("/users", user);
    }
    setIsSubmitting(false);
    setIsEditMode(false);
    resetAddUserForm();
    fetchUsers();
    setShowAddUser(false);
  };

  const handleDeleteUser = async (row) => {
    try {
      await api.delete(`/users/${row.id}`);

      //      const user = response.data.data;

      // Refresh the table
      fetchUsers();

      console.log("User deleted successfully.");
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleViewUser = async (row) => {
    try {
      const response = await api.get(`/users/${row.id}`);

      setViewUser(response.data.data);
      setShowViewUser(true);
    } catch (error) {
      console.error(error);
    }
  };

  const formatValue = (value) => value || "Not provided";

  const formatDate = (value) => {
    if (!value) return "Not provided";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  const getUserImageSrc = (user) => {
    const image =
      user?.profileImage ||
      user?.profile_image ||
      user?.profile_photo_path ||
      user?.image;

    if (!image) return null;
    if (
      typeof image === "string" &&
      (image.startsWith("http") ||
        image.startsWith("blob:") ||
        image.startsWith("data:"))
    ) {
      return image;
    }

    return storageUrl(image);
  };

  const getInitials = (name = "", username = "") => {
    const source = name || username || "User";
    return source
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const getStatusClass = (statusValue = "") => {
    const normalized = statusValue.toLowerCase();

    if (normalized === "active") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30";
    }

    if (normalized === "blocked" || normalized === "suspended") {
      return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30";
    }

    return "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700/60 dark:text-gray-200 dark:ring-gray-600";
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
        {formatValue(value)}
      </p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Users
        </h1>

        <Button
          variant="primary"
          onClick={() => {
            setIsFormRole(true);
            setShowAddUser(true);
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
          Add User
        </Button>
        <Dialog
          isOpen={showAddUser}
          onClose={handleCloseAddUser}
          title={isEditMode ? "Edit User" : "Add User"}
          size="medium"
          primaryButtonText={
            isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"
          }
          secondaryButtonText="Cancel"
          primaryButtonDisabled={isSubmitting}
          secondaryButtonDisabled={isSubmitting}
          onPrimaryButtonClick={handleSubmitUser}
          onSecondaryButtonClick={handleCloseAddUser}
        >
          <ImageUploadField
            required
            label="Profile Image"
            value={formData.uploadedImage}
            onChange={(image) =>
              setFormData({ ...formData, uploadedImage: image })
            }
            helperText="Upload a profile image (JPG, PNG)"
            accept="image/*"
            variant="outlined"
            fullWidth
          />
          <div className="grid grid-cols-[5fr_1fr] gap-4 mb-4 pt-4">
            <TextField
              required
              label="Full Name"
              value={formData.fullname}
              onChange={(e) => {
                setFormData({ ...formData, fullname: e.target.value });
                setFieldError("fullname", "");
              }}
              helperText={fieldErrors.fullname || ""}
              error={!!fieldErrors.fullname}
            />
            <SelectField
              label="Access Level"
              value={formData.accessLevel}
              options={accessLevels}
              onChange={(e) => {
                setFormData({ ...formData, accessLevel: e.target.value });
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pb-4">
            <TextField
              required
              fullWidth={true}
              label="Username"
              value={formData.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              helperText={fieldErrors.username || ""}
              error={!!fieldErrors.username}
            />
            <TextField
              required
              fullWidth={true}
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setFieldError("email", "");
              }}
              helperText={fieldErrors.email || ""}
              error={!!fieldErrors.email}
            />
            <PhoneField
              required
              label="Phone Number"
              defaultCode="+94"
              value={formData.phone}
              onChange={(value) => {
                setFormData({ ...formData, phone: value });
                setFieldError("phone", "");
              }}
              fullWidth
              helperText={fieldErrors.phone || ""}
              error={!!fieldErrors.phone}
            />

            <PhoneField
              required
              label="whatsapp Number"
              defaultCode="+94"
              value={formData.whatsapp}
              onChange={(value) => {
                setFormData({ ...formData, whatsapp: value });
                setFieldError("whatsapp", "");
              }}
              fullWidth
              helperText={fieldErrors.whatsapp || ""}
              error={!!fieldErrors.whatsapp}
            />
            <SelectField
              required
              fullwidth={true}
              label="Select Role"
              value={formData.roleOption}
              options={roles}
              onChange={(e) => {
                handleRoleChange(e.target.value);
              }}
            />
            <SelectField
              required
              fullwidth={true}
              label="Select Branch"
              value={formData.branchOption}
              options={branches}
              onChange={(e) => {
                setFormData({ ...formData, branchOption: e.target.value });
                setFieldError("branch", "");
              }}
              helperText={fieldErrors.branch || ""}
              error={!!fieldErrors.branch}
            />
            <TextField
              type="date"
              floatLabel={true}
              label="Date of Birth"
              value={formData.dob}
              onChange={(e) => {
                setFormData({ ...formData, dob: e.target.value });
              }}
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
          <div className=" pb-4">
            <TextAreaField
              label="Address"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
              }}
              rows={2}
              resize="vertical"
              maxLength={100}
            />
          </div>
          {!isEditMode && (
            <div className="pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 w-full">
                <TextField
                  required
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setFieldError("password", "");

                    if (
                      formData.confirmPassword &&
                      e.target.value !== formData.confirmPassword
                    ) {
                      setFieldError(
                        "confirmPassword",
                        "Password and Confirm Password must match.",
                      );
                    } else {
                      setFieldError("confirmPassword", "");
                    }
                  }}
                  fullWidth={true}
                  helperText={fieldErrors.password || ""}
                  error={!!fieldErrors.password}
                />

                <TextField
                  required
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    });
                    setFieldError(
                      "confirmPassword",
                      e.target.value && e.target.value !== formData.password
                        ? "Password and Confirm Password must match."
                        : "",
                    );
                  }}
                  fullWidth={true}
                  helperText={fieldErrors.confirmPassword || ""}
                  error={!!fieldErrors.confirmPassword}
                />
              </div>

              {shouldShowPin && (
                <div className="grid grid-cols-2 gap-4 w-full">
                  <TextField
                    required={shouldValidatePin}
                    label="PIN"
                    type="password"
                    value={formData.pin}
                    onChange={(e) => {
                      setFormData({ ...formData, pin: e.target.value });
                      setFieldError("pin", "");

                      if (
                        formData.confirmPin &&
                        e.target.value !== formData.confirmPin
                      ) {
                        setFieldError(
                          "confirmPin",
                          "PIN and Confirm PIN must match.",
                        );
                      } else {
                        setFieldError("confirmPin", "");
                      }
                    }}
                    fullWidth={true}
                    helperText={fieldErrors.pin || ""}
                    error={!!fieldErrors.pin}
                  />

                  <TextField
                    required={shouldValidatePin}
                    label="Confirm PIN"
                    type="password"
                    value={formData.confirmPin}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPin: e.target.value });
                      setFieldError(
                        "confirmPin",
                        e.target.value && e.target.value !== formData.pin
                          ? "PIN and Confirm PIN must match."
                          : "",
                      );
                    }}
                    fullWidth={true}
                    helperText={fieldErrors.confirmPin || ""}
                    error={!!fieldErrors.confirmPin}
                  />
                </div>
              )}
            </div>
          )}
        </Dialog>
      </div>
      <Accordion
        items={[
          {
            title: "Additional Search",
            content: (
              <div className="grid grid-cols-3 gap-4 w-full">
                <SelectField
                  label="Roles"
                  value={filters.role}
                  options={roles}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                />
                <SelectField
                  label="Branch"
                  value={filters.branch}
                  options={branches}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      branch: e.target.value,
                    }))
                  }
                />
                <SelectField
                  label="Status"
                  value={filters.status}
                  options={status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
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
          data={users}
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
              onClick: handleEditUser,
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
              onClick: handleDeleteUser,
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
              onClick: handleViewUser,
            },
          ]}
        />
      </div>
      <Dialog
        isOpen={showViewUser}
        onClose={() => setShowViewUser(false)}
        title="User Profile"
        size="medium"
        showFooter={false}
      >
        {viewUser && (
          <div className="space-y-6">
            <div className="flex flex-col gap-5 rounded border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-[#202024] sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 text-2xl font-semibold text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {viewUser.profileImage ? (
                  <img
                    src={viewUser.profileImage}
                    alt={viewUser.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>
                    {(viewUser.name || viewUser.username || "U")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">
                      {viewUser.name || "Not provided"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      @{viewUser.username || "not-provided"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                      {viewUser.status || "Not provided"}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30">
                      Level{" "}
                      {viewUser.accessLevel ||
                        viewUser.role?.access_level ||
                        "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
                  <p className="truncate">{viewUser.email || "No email"}</p>
                  <p className="truncate">{viewUser.phone || "No phone"}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Work Details
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Role" value={viewUser.role?.name} />
                <DetailItem label="Branch" value={viewUser.branch?.name} />
                <DetailItem
                  label="Access Level"
                  value={viewUser.accessLevel || viewUser.role?.access_level}
                />
                <DetailItem label="Status" value={viewUser.status} />
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Personal Details
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Full Name" value={viewUser.name} />
                <DetailItem label="Username" value={viewUser.username} />
                <DetailItem label="Email" value={viewUser.email} />
                <DetailItem label="Phone" value={viewUser.phone} />
                <DetailItem label="Whatsapp" value={viewUser.whatsapp} />
                <DetailItem label="Date of Birth" value={viewUser.dob} />
                <DetailItem label="Address" value={viewUser.address} wide />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Users;
