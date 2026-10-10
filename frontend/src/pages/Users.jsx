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
import { ActionMenu } from "../components/ActionMenu";
import { Accordion } from "../components/Accordion";
import { Alert, Dialog, Snackbar, Loading, Drawer } from "../components/Popups";
import { SectionDivider, VerticalTabs } from "../components/SectionDivider";
import { Stepper } from "../components/Stepper";
import { AddItem } from "../components/AddItem";
import { ProfileView } from "../components/ProfileView";
import { Chip } from "../components/Chip";
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
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [deleteUserCandidate, setDeleteUserCandidate] = useState(null);

  const status = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "blocked", label: "Blocked" },
  ];
  const filterStatus = [{ value: "", label: "All Status" }, ...status];

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
    { key: "statusChip", label: "Status" },
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
      const formattedRoles = rolesData.map((role) => ({
          value: role.id,
          label: role.name,
        }));
      setRoles(formattedRoles);
    });
  }, []);

  useEffect(() => {
    api.get("/branches").then((response) => {
      const branchesData = response.data.data.data;
      const formattedBranches = branchesData.map((branch) => ({
        value: branch.id,
        label: branch.name,
      }));
      setBranches(formattedBranches);
    });
  }, []);

  const filterRoles = [{ value: "", label: "All Roles" }, ...roles];
  const filterBranches = [{ value: "", label: "All Branches" }, ...branches];

  const [filters, setFilters] = useState({
    role: "",
    branch: "",
    status: "active",
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const response = await api.get("/users", {
        params: filters,
      });

      const usersData = response.data.data.map((user) => {
        const imageUrl = getUserImageSrc(user);
        const name = user.name || user.username || "User";
        const initials = name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("");

        return {
          id: user.id,
          fullname: user.name,
          profileImage: (
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600 dark:border-[#1F2226] dark:bg-[#161719] dark:text-[#D0D6E0]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${name} profile`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                initials
              )}
            </div>
          ),
          username: user.username,
          role: user.role ? user.role.name : "N/A",
          roleAccessLevel: user.role?.access_level,
          branch: user.branch ? user.branch.name : "N/A",
          phone: user.phone,
          email: user.email,
          status: user.status
            ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
            : "N/A",
          statusChip: <Chip status={user.status || "N/A"} size="small" />,
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUsersLoading(false);
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
        statusOption: (user.status || "active").toLowerCase(),
        accessLevel: user.accessLevel || "5",
        uploadedImage: user.image || user.profileImage || null,
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
    const selectedRole = roles
      .find((role) => String(role.value) === String(value))
      ?.label?.toLowerCase();
    const shouldKeepPin = pinRoles.includes(selectedRole);

    setFormData((prev) => ({
      ...prev,
      roleOption: value,
      password: "",
      confirmPassword: "",
      ...(shouldKeepPin ? {} : { pin: "", confirmPin: "" }),
    }));

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
    resetAddUserForm();
    setShowAddUser(false);
    setIsEditMode(false);
    setEditingUser(null);
  };
  const handleSubmitUser = async () => {
    if (!validateSubmit()) return;

    setIsSubmitting(true);
    try {
      const userData = new FormData();
      const fields = {
        name: formData.fullname,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        dob: formData.dob,
        address: formData.address,
        role_id: formData.roleOption,
        branch_id: formData.branchOption,
        status: formData.statusOption.toLowerCase(),
      };

      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) userData.append(key, value);
      });

      if (!isEditMode || formData.password) {
        userData.append("password", formData.password);
      }
      if (formData.pin) userData.append("pin", formData.pin);

      if (formData.uploadedImage instanceof File) {
        userData.append("image", formData.uploadedImage);
      } else if (isEditMode && !formData.uploadedImage && editingUser?.image) {
        userData.append("remove_image", "1");
      }

      const uploadConfig = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (isEditMode) {
        userData.append("_method", "PUT");
        await api.post(`/users/${editingUser.id}`, userData, uploadConfig);
      } else {
        await api.post("/users", userData, uploadConfig);
      }

      setIsEditMode(false);
      resetAddUserForm();
      setShowAddUser(false);
      fetchUsers();
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        setFieldErrors((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.entries(validationErrors).map(([field, messages]) => [
              field === "image" ? "image" : field,
              Array.isArray(messages) ? messages[0] : messages,
            ]),
          ),
        }));
      }
      console.error("Failed to save user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (row) => {
    setDeleteUserCandidate(row);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserCandidate) return;

    try {
      await api.delete(`/users/${deleteUserCandidate.id}`);

      fetchUsers();
      setDeleteUserCandidate(null);
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-[#F7F8F8]">
          Users
        </h1>

        <Button
          variant="primary"
          onClick={() => setShowAddUser(true)}
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
          <div className="grid grid-cols-1 items-start gap-4 pb-4 sm:grid-cols-[120px_minmax(0,1fr)]">
            <ImageUploadField
              required
              label="Profile Image"
              value={formData.uploadedImage}
              onChange={(image) =>
                setFormData({ ...formData, uploadedImage: image })
              }
              helperText={fieldErrors.image || "Upload a profile image"}
              error={!!fieldErrors.image}
              accept="image/jpeg,image/png,image/webp"
              variant="outlined"
              fullWidth
            />
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
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
                className="sm:col-span-2"
              />
              <TextField
                required
                label="Username"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                helperText={fieldErrors.username || ""}
                error={!!fieldErrors.username}
              />
              <SelectField
                label="Access Level"
                value={formData.accessLevel}
                options={accessLevels}
                onChange={(e) => {
                  setFormData({ ...formData, accessLevel: e.target.value });
                }}
              />
              <TextField
                required
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setFieldError("email", "");
                }}
                helperText={fieldErrors.email || ""}
                error={!!fieldErrors.email}
                className="sm:col-span-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pb-4">
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
                  options={filterRoles}
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
                  options={filterBranches}
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
                  options={filterStatus}
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
          loading={isUsersLoading}
          onRowClick={handleViewUser}
          actionsAlign="right"
          showActionsHeader={false}
          actions={(row) => [
            {
              label: "User actions",
              render: () => (
                <ActionMenu
                  label={`Actions for ${row.fullname || row.username || "user"}`}
                  items={[
                    { label: "Edit user", onClick: () => handleEditUser(row) },
                    {
                      label: "Delete user",
                      variant: "danger",
                      disabled:
                        Number(row.roleAccessLevel) === 5 ||
                        row.role?.toLowerCase?.() === "admin",
                      onClick: () => handleDeleteUser(row),
                    },
                  ]}
                />
              ),
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
          <ProfileView
            title={viewUser.name}
            subtitle={viewUser.username ? `@${viewUser.username}` : "No username"}
            avatar={getUserImageSrc(viewUser)}
            avatarAlt={viewUser.name || "User"}
            badges={[
              { value: viewUser.status },
              {
                label: "Level",
                value: viewUser.accessLevel || viewUser.role?.access_level || "N/A",
                tone: "default",
              },
            ]}
            highlights={[
              { label: "Email", value: viewUser.email },
              { label: "Phone", value: viewUser.phone },
              { label: "Role", value: viewUser.role?.name },
            ]}
            sections={[
              {
                title: "Work Details",
                items: [
                  { label: "Role", value: viewUser.role?.name },
                  { label: "Branch", value: viewUser.branch?.name },
                  {
                    label: "Access Level",
                    value: viewUser.accessLevel || viewUser.role?.access_level,
                  },
                  { label: "Status", value: viewUser.status },
                ],
              },
              {
                title: "Personal Details",
                items: [
                  { label: "Full Name", value: viewUser.name },
                  { label: "Username", value: viewUser.username },
                  { label: "Email", value: viewUser.email },
                  { label: "Phone", value: viewUser.phone },
                  { label: "Whatsapp", value: viewUser.whatsapp },
                  { label: "Date of Birth", value: formatDate(viewUser.dob) },
                  { label: "Address", value: viewUser.address, wide: true },
                ],
              },
            ]}
          />
        )}
      </Dialog>
      <Dialog
        isOpen={Boolean(deleteUserCandidate)}
        onClose={() => setDeleteUserCandidate(null)}
        title="Delete User"
        size="small"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onPrimaryButtonClick={confirmDeleteUser}
        onSecondaryButtonClick={() => setDeleteUserCandidate(null)}
      >
        <p className="text-sm text-slate-600 dark:text-[#D0D6E0]">
          Are you sure you want to delete{" "}
          <strong>
            {deleteUserCandidate?.fullname ||
              deleteUserCandidate?.username ||
              "this user"}
          </strong>
          ?
        </p>
      </Dialog>
    </div>
  );
};

export default Users;
