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

  const fetchUsers = async () => {
    api.get("/users").then((response) => {
      const usersData = response.data.data.map((user) => ({
        id: user.id,
        profileImage: user.profileImage,
        username: user.username,
        role: user.role ? user.role.name : "N/A",
        branch: user.branch ? user.branch.name : "N/A",
        phone: user.phone,
        email: user.email,
        status: user.status,
      }));
      console.log(usersData);
      setUsers(usersData);
    });
  };

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
      console.log(branchesData);
      const formattedBranches = branchesData.map((branch) => ({
        value: branch.id,
        label: branch.name,
      }));
      setBranches(formattedBranches);
    });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

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
    { key: "id", label: "ID", sortable: true },
    { key: "profileImage", label: "Image" },
    { key: "username", label: "Username", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "branch", label: "Branch", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
  ];

  const pinRoles = ["cashier", "waiter"];
  const roleSelected = Boolean(formData.roleOption);
  const shouldShowPin = roleSelected && pinRoles.includes(formData.roleOption);
  const shouldValidatePin = pinRoles.includes(formData.roleOption);

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
    if (!pinRoles.includes(value)) {
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
    if (!formData.roleOption) errors.setRole = "Role is required.";
    if (!formData.branchOption) errors.setBranch = "Branch is required.";

    const usernameExists = users.some(
      (user) =>
        user.username.toLowerCase() === formData.username.trim().toLowerCase(),
    );

    if (usernameExists) {
      errors.username = "Username already exists.";
    }

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
      pin: shouldValidatePin ? formData.pin : "",
      password: shouldValidatePin ? "" : formData.password,
    };

    console.log("Submitted user:", user);
    api.post("/users", user);
    setIsSubmitting(false);
    resetAddUserForm();
    fetchUsers();
    setShowAddUser(false);
  };
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
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
          title="Add User"
          size="medium"
          primaryButtonText={isSubmitting ? "Saving..." : "Save"}
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
                setFormData({ ...formData, roleOption: e.target.value });
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
              value={formData.status}
              options={status}
              onChange={(e) => {
                setFormData({ ...formData, status: e.target.value });
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
                  setFormData({ ...formData, confirmPassword: e.target.value });
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
        </Dialog>
      </div>
      <Accordion
        items={[
          {
            title: "Additional Search",
            content: (
              <div className="flex  gap-4 w-full">
                <SelectField
                  label="Role"
                  value={formData.roleOption}
                  options={roles}
                  onChange={(e) =>
                    setFormData({ ...formData, roleOption: e.target.value })
                  }
                  fullWidth={true}
                />
                <SelectField
                  label="Branch"
                  value={formData.branchOption}
                  options={branches}
                  onChange={(e) =>
                    setFormData({ ...formData, branchOption: e.target.value })
                  }
                  fullWidth={true}
                />
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
              onClick: (row) => console.log("Edit", row),
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
              onClick: (row) => console.log("Delete", row),
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
              onClick: (row) => console.log("View", row),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Users;
