import React, { useState, useMemo } from "react";
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

export const Users = () => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [phone, setphone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [roleOption, setRole] = useState("");
  const [branchOption, setBranch] = useState("");
  const [statusOption, setStatusOption] = useState("Active");
  const [accessLevel, setAccessLevel] = useState("5");
  const [showAddUser, setShowAddUser] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { value: "admin", label: "Administrator" },
    { value: "manager", label: "Manager" },
    { value: "cashier", label: "Cashier" },
    { value: "waiter", label: "Waiter" },
    { value: "kitchen_staff", label: "Kitchen Staff" },
  ];

  const branches = [
    { value: "Kalutara", label: "Kalutara" },
    { value: "Gampaha", label: "Gampaha" },
    { value: "Colombo", label: "Colombo" },
  ];

  const status = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
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

  const data = [
    {
      id: 1,
      profileImage: null,
      username: "johndoe",
      role: "admin",
      branch: "Kalutara",
      phone: "123-456-7890",
      email: "john@example.com",
      status: "Active",
    },
    {
      id: 2,
      profileImage: null,
      username: "janesmith",
      role: "manager",
      branch: "Gampaha",
      phone: "098-765-4321",
      email: "jane@example.com",
      status: "Inactive",
    },
  ];

  const pinRoles = ["cashier", "waiter"];
  const roleSelected = Boolean(roleOption);
  const shouldShowPin = !roleSelected || pinRoles.includes(roleOption);
  const shouldValidatePin = pinRoles.includes(roleOption);

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
    setRole(value);

    setPassword("");
    setConfirmPassword("");
    if (!pinRoles.includes(value)) {
      setPin("");
      setConfirmPin("");
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
    setUsername(value);

    const usernameExists = data.some(
      (user) => user.username.toLowerCase() === value.trim().toLowerCase(),
    );

    if (usernameExists) {
      setFieldError("username", "Username already exists.");
    } else {
      setFieldError("username", "");
    }
  };

  const validateSubmit = () => {
    const errors = {};

    if (!fullname.trim()) errors.fullname = "Full name is required.";
    if (!username.trim()) errors.username = "Username is required.";
    if (!email.trim()) errors.email = "Email is required.";
    if (!phone) errors.phone = "Phone number is required.";
    if (!whatsapp) errors.whatsapp = "Whatsapp number is required.";
    if (!userRole) errors.role = "Role is required.";
    if (!branchOption) errors.branch = "Branch is required.";
    if (!dob) errors.dob = "Date of birth is required.";
    if (!statusOption) errors.status = "Status is required.";
    if (!accessLevel) errors.accessLevel = "Access level is required.";
    if (!address.trim()) errors.address = "Address is required.";

    const usernameExists = data.some(
      (user) => user.username.toLowerCase() === username.trim().toLowerCase(),
    );

    if (usernameExists) {
      errors.username = "Username already exists.";
    }

    if (shouldValidatePin) {
      if (!pin) {
        errors.pin = "PIN is required.";
      } else if (!/^\d{4}$/.test(pin)) {
        errors.pin = "PIN must be numeric and exactly 4 digits.";
      }

      if (!confirmPin) {
        errors.confirmPin = "Confirm PIN is required.";
      } else if (pin !== confirmPin) {
        errors.confirmPin = "PIN and Confirm PIN must match.";
      }
    } else {
      if (!password) {
        errors.password = "Password is required.";
      } else if (!passwordRegex.test(password)) {
        errors.password =
          "Password must include uppercase, lowercase, number, symbol, and at least 8 characters.";
      }

      if (!confirmPassword) {
        errors.confirmPassword = "Confirm Password is required.";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Password and Confirm Password must match.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitUser = async () => {
    if (!validateSubmit()) return;

    setIsSubmitting(true);

    const user = {
      fullname,
      username,
      email,
      phone,
      whatsapp,
      dob,
      address,
      role: userRole,
      branch: branchOption,
      status: statusOption,
      accessLevel,
      profileImage: uploadedImage,
      authType: shouldValidatePin ? "pin" : "password",
      pin: shouldValidatePin ? pin : "",
      password,
    };

    console.log("Submitted user:", user);

    setIsSubmitting(false);
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
          onClose={() => setShowAddUser(false)}
          title="Add User"
          size="medium"
          primaryButtonText={isSubmitting ? "Saving..." : "Save"}
          secondaryButtonText="Cancel"
          primaryButtonDisabled={isSubmitting}
          secondaryButtonDisabled={isSubmitting}
          onPrimaryButtonClick={handleSubmitUser}
          onSecondaryButtonClick={() => setShowAddUser(false)}
        >
          <ImageUploadField
            required
            label="Profile Image"
            value={uploadedImage}
            onChange={setUploadedImage}
            helperText="Upload a profile image (JPG, PNG)"
            accept="image/*"
            variant="outlined"
            fullWidth
          />
          <div className="grid grid-cols-[3fr_1fr] gap-4 mb-4 pt-4">
            <TextField
              required
              label="Full Name"
              value={fullname}
              onChange={(e) => {
                setFullname(e.target.value);
                setFieldError("fullname", "");
              }}
              helperText={fieldErrors.fullname || ""}
            />
            <SelectField
              required
              label="Access Level"
              value={accessLevel}
              options={accessLevels}
              onChange={(e) => {
                setAccessLevel(e.target.value);
                setFieldError("accessLevel", "");
              }}
              helperText={fieldErrors.accessLevel || ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pb-4">
            <TextField
              required
              fullWidth={true}
              label="Username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              helperText={fieldErrors.username || ""}
            />
            <TextField
              required
              fullWidth={true}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError("email", "");
              }}
              helperText={fieldErrors.email || ""}
            />
            <PhoneField
              required
              label="Phone Number"
              value={phone}
              onChange={(value) => {
                setPhone(value);
                setFieldError("phone", "");
              }}
              fullWidth
              helperText={fieldErrors.phone || ""}
            />

            <PhoneField
              required
              label="whatsapp Number"
              value={whatsapp}
              onChange={(value) => {
                setWhatsapp(value);
                setFieldError("whatsapp", "");
              }}
              fullWidth
              helperText={fieldErrors.whatsapp || ""}
            />
            <SelectField
              required
              fullwidth={true}
              label="Select Role"
              value={roleOption}
              options={roles}
              onChange={(e) => handleRoleChange(e.target.value)}
              helperText={fieldErrors.role || ""}
            />
            <SelectField
              required
              fullwidth={true}
              label="Select Branch"
              value={branchOption}
              options={branches}
              onChange={(e) => {
                setBranch(e.target.value);
                setFieldError("branch", "");
              }}
              helperText={fieldErrors.branch || ""}
            />
            <TextField
              required
              type="date"
              floatLabel={true}
              label="Date of Birth"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                setFieldError("dob", "");
              }}
              helperText={fieldErrors.dob || ""}
            />
            <SelectField
              required
              fullwidth={true}
              label="Status"
              value={statusOption}
              options={status}
              onChange={(e) => {
                setStatusOption(e.target.value);
                setFieldError("status", "");
              }}
              helperText={fieldErrors.status || ""}
            />
          </div>
          <div className=" pb-4">
            <TextAreaField
              required
              label="Address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setFieldError("address", "");
              }}
              rows={2}
              resize="vertical"
              maxLength={100}
              helperText={fieldErrors.address || ""}
            />
          </div>
          <div className="pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 w-full">
              <TextField
                required
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldError("password", "");

                  if (confirmPassword && e.target.value !== confirmPassword) {
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
              />

              <TextField
                required
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldError(
                    "confirmPassword",
                    e.target.value && e.target.value !== password
                      ? "Password and Confirm Password must match."
                      : "",
                  );
                }}
                fullWidth={true}
                helperText={fieldErrors.confirmPassword || ""}
              />
            </div>

            {shouldShowPin && (
              <div className="grid grid-cols-2 gap-4 w-full">
                <TextField
                  required={shouldValidatePin}
                  label="PIN"
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setFieldError("pin", "");

                    if (confirmPin && e.target.value !== confirmPin) {
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
                />

                <TextField
                  required={shouldValidatePin}
                  label="Confirm PIN"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => {
                    setConfirmPin(e.target.value);
                    setFieldError(
                      "confirmPin",
                      e.target.value && e.target.value !== pin
                        ? "PIN and Confirm PIN must match."
                        : "",
                    );
                  }}
                  fullWidth={true}
                  helperText={fieldErrors.confirmPin || ""}
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
                  value={roleOption}
                  options={roles}
                  onChange={(e) => setRole(e.target.value)}
                  fullWidth={true}
                />
                <SelectField
                  label="Branch"
                  value={branchOption}
                  options={branches}
                  onChange={(e) => setBranch(e.target.value)}
                  fullWidth={true}
                />
                <SelectField
                  label="Status"
                  value={statusOption}
                  options={status}
                  onChange={(e) => setStatusOption(e.target.value)}
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
          data={data}
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
