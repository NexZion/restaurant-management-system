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

export const Customers = () => {
  const [formData, setFormData] = useState({
    customer_code: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    district: "",
    postal_code: "",
    customer_type: "",
    id_number: "",
    id_type: "nic",
    statusOption: "active",
  });

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [isSameAsPhone, setIsSameAsPhone] = useState(false);
  const [isDisabledWhatsapp, setIsDisabledWhatsapp] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewCustomer, setShowViewCustomer] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      console.log("Fetched customers:", response);
      const customerData = response.data.data.data.map((customer) => ({
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        customer_type: customer.customer_type,
        district: customer.district,
        phone: customer.phone,
        statusOption: customer.status,
      }));
      setCustomers(customerData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const districts = [
    { value: "Ampara", label: "Ampara" },
    { value: "Anuradhapura", label: "Anuradhapura" },
    { value: "Badulla", label: "Badulla" },
    { value: "Batticaloa", label: "Batticaloa" },
    { value: "Colombo", label: "Colombo" },
    { value: "Galle", label: "Galle" },
    { value: "Gampaha", label: "Gampaha" },
    { value: "Hambantota", label: "Hambantota" },
    { value: "Jaffna", label: "Jaffna" },
    { value: "Kalutara", label: "Kalutara" },
    { value: "Kandy", label: "Kandy" },
    { value: "Kegalle", label: "Kegalle" },
    { value: "Kilinochchi", label: "Kilinochchi" },
    { value: "Kurunegala", label: "Kurunegala" },
    { value: "Mannar", label: "Mannar" },
    { value: "Matale", label: "Matale" },
    { value: "Matara", label: "Matara" },
    { value: "Monaragala", label: "Monaragala" },
    { value: "Mullaitivu", label: "Mullaitivu" },
    { value: "Nuwara Eliya", label: "Nuwara Eliya" },
    { value: "Polonnaruwa", label: "Polonnaruwa" },
    { value: "Puttalam", label: "Puttalam" },
    { value: "Ratnapura", label: "Ratnapura" },
    { value: "Trincomalee", label: "Trincomalee" },
    { value: "Vavuniya", label: "Vavuniya" },
  ];

  const customerTypes = [
    { value: "regular", label: "Normal Customer" },
    { value: "corporate", label: "Corporate Customer" },
    { value: "vip", label: "VIP Customer" },
  ];

  const status = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  const idTypes = [
    { value: "nic", label: "NIC" },
    { value: "passport", label: "Passport" },
  ];

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "name", sortable: true },
    { key: "customer_type", label: "Customer Type", sortable: true },
    { key: "district", label: "District" },
    { key: "phone", label: "Phone" },
    { key: "statusOption", label: "Status" },
  ];

  const handleEditCustomer = async (row) => {
    try {
      console.log("Editing customer with ID:", row.id);
      const response = await api.get(`/customers/${row.id}`);
      console.log("Fetched customer data:", response.data.data.customer_code);
      const customer = response.data.data;

      setEditingCustomer(customer);
      setIsEditMode(true);

      setFormData({
        id: customer.id,
        customer_code: customer.customer_code || "",
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        whatsapp: customer.whatsapp || "",
        statusOption: customer.status || "active",
        address_line1: customer.address_line1 || "",
        address_line2: customer.address_line2 || "",
        city: customer.city || "",
        state: customer.state || "",
        district: customer.district || "",
        postal_code: customer.postal_code || "",
        customer_type: customer.customer_type || "",
        id_number: customer.id_number || "",
        id_type: customer.id_type || "nic",
      });

      setShowAddCustomer(true);
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

    if (!(formData.first_name || "").trim())
      errors.first_name = "First name is required.";
    if (!(formData.last_name || "").trim())
      errors.last_name = "Last name is required.";
    if (!(formData.id_number || "").trim())
      errors.id_number = "ID number is required.";
    if (!(formData.email || "").trim()) errors.email = "Email is required.";
    if (!formData.phone) errors.phone = "Phone number is required.";
    if (!formData.whatsapp) errors.whatsapp = "Whatsapp number is required.";

    setFieldErrors(errors);
    console.log(errors);
    return Object.keys(errors).length === 0;
  };

  const resetAddCustomerForm = () => {
    setFormData({
      customer_code: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      whatsapp: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      district: "",
      postal_code: "",
      customer_type: "",
      id_number: "",
      id_type: "nic",
      statusOption: "active",
    });
    setFieldErrors({});
  };

  const handleCloseAddCustomer = () => {
    resetAddCustomerForm();
    setShowAddCustomer(false);
    setIsEditMode(false);
    setEditingCustomer(null);
  };

  const handleSubmitCustomer = () => {
    console.log(fieldErrors);
    if (!validateSubmit()) return;

    setIsSubmitting(true);

    const customer = {
      customer_code: formData.customer_code,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      id_number: formData.id_number,
      id_type: formData.id_type,
      customer_type: formData.customer_type,
      address_line1: formData.address_line1,
      address_line2: formData.address_line2,
      city: formData.city,
      state: formData.state,
      district: formData.district,
      postal_code: formData.postal_code,
      status: formData.statusOption,
    };

    console.log("Submitted customer:", customer);
    if (isEditMode) {
      console.log("Editing customer with ID:", editingCustomer.id);
      api.put(`/customers/${editingCustomer.id}`, customer);
    } else {
      api.post("/customers", customer);
    }

    setIsSubmitting(false);
    setIsEditMode(false);
    resetAddCustomerForm();
    fetchCustomers();
    setShowAddCustomer(false);
  };

  const handleDeleteCustomer = async (row) => {
    try {
      await api.delete(`/customers/${row.id}`);

      //      const user = response.data.data;

      // Refresh the table
      fetchCustomers();

      console.log("Customer deleted successfully.");
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  const handleViewCustomer = async (row) => {
    try {
      const response = await api.get(`/customers/${row.id}`);

      setViewCustomer(response.data.data);
      setShowViewCustomer(true);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Customers
        </h1>

        <Button
          variant="primary"
          onClick={() => {
            resetAddCustomerForm();
            setShowAddCustomer(true);
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
          Add Customer
        </Button>
        <Dialog
          isOpen={showAddCustomer}
          onClose={handleCloseAddCustomer}
          title={isEditMode ? "Edit Customer" : "Add Customer"}
          size="large"
          primaryButtonText={
            isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"
          }
          secondaryButtonText="Cancel"
          primaryButtonDisabled={isSubmitting}
          secondaryButtonDisabled={isSubmitting}
          onPrimaryButtonClick={handleSubmitCustomer}
          onSecondaryButtonClick={handleCloseAddCustomer}
        >
          <Accordion
            items={[
              {
                title: "Basic Information",
                content: (
                  <div className="grid grid-cols-2 gap-4 w-full pb-4">
                    <SelectField
                      label="Customer Type"
                      value={formData.customer_type}
                      options={customerTypes}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          customer_type: e.target.value,
                        });
                        setFieldError("customer_type", "");
                      }}
                      helperText={fieldErrors.customer_type || ""}
                      error={!!fieldErrors.customer_type}
                    />
                    <SelectField
                      label="Status"
                      value={formData.statusOption}
                      options={status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          statusOption: e.target.value,
                        })
                      }
                      fullWidth={true}
                    />
                  </div>
                ),
              },
              {
                title: "Personal Information",
                content: (
                  <div className="grid grid-cols-2 gap-4 w-full pb-4">
                    <TextField
                      required
                      label="First Name"
                      value={formData.first_name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          first_name: e.target.value,
                        });
                        setFieldError("first_name", "");
                      }}
                      helperText={fieldErrors.first_name || ""}
                      error={!!fieldErrors.first_name}
                    />
                    <TextField
                      required
                      label="Last Name"
                      value={formData.last_name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          last_name: e.target.value,
                        });
                        setFieldError("last_name", "");
                      }}
                      helperText={fieldErrors.last_name || ""}
                      error={!!fieldErrors.last_name}
                    />
                    <SelectField
                      label="ID Type"
                      value={formData.id_type}
                      options={idTypes}
                      onChange={(e) => {
                        setFormData({ ...formData, id_type: e.target.value });
                        setFieldError("id_type", "");
                      }}
                      helperText={fieldErrors.id_type || ""}
                      error={!!fieldErrors.id_type}
                    />
                    <TextField
                      label="ID Number"
                      value={formData.id_number}
                      onChange={(e) => {
                        setFormData({ ...formData, id_number: e.target.value });
                        setFieldError("id_number", "");
                      }}
                      helperText={fieldErrors.id_number || ""}
                      error={!!fieldErrors.id_number}
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
                      disabled={isDisabledWhatsapp}
                      value={formData.whatsapp}
                      onChange={(value) => {
                        setFormData({ ...formData, whatsapp: value });
                        setFieldError("whatsapp", "");
                      }}
                      fullWidth
                      helperText={fieldErrors.whatsapp || ""}
                      error={!!fieldErrors.whatsapp}
                    />

                    <CheckboxField
                      label="Same as Phone Number"
                      checked={isSameAsPhone}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setIsSameAsPhone(true);
                          setFormData({
                            ...formData,
                            whatsapp: formData.phone,
                          });
                          setIsDisabledWhatsapp(true);
                        } else {
                          setIsSameAsPhone(false);
                          setIsDisabledWhatsapp(false);
                        }
                      }}
                    />
                  </div>
                ),
              },
              {
                title: "Address",
                content: (
                  <div>
                    <TextField
                      label="Address Line 1"
                      value={formData.address_line1}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          address_line1: e.target.value,
                        });
                      }}
                      rows={1}
                      className="mb-4"
                      resize="vertical"
                      maxLength={50}
                    />
                    <TextField
                      label="Address Line 2"
                      value={formData.address_line2}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          address_line2: e.target.value,
                        });
                      }}
                      rows={1}
                      className="mb-4"
                      resize="vertical"
                      maxLength={50}
                    />
                    <div className="grid grid-cols-2 gap-4 w-full pb-4">
                      <TextField
                        label="City"
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value });
                          setFieldError("city", "");
                        }}
                        helperText={fieldErrors.city || ""}
                        error={!!fieldErrors.city}
                      />
                      <TextField
                        label="State"
                        value={formData.state}
                        onChange={(e) => {
                          setFormData({ ...formData, state: e.target.value });
                          setFieldError("state", "");
                        }}
                        helperText={fieldErrors.state || ""}
                        error={!!fieldErrors.state}
                      />
                      <SelectField
                        label="District"
                        value={formData.district}
                        options={districts}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            district: e.target.value,
                          });
                          setFieldError("district", "");
                        }}
                        helperText={fieldErrors.district || ""}
                        error={!!fieldErrors.district}
                      />
                      <TextField
                        label="Postal Code"
                        value={formData.postal_code}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            postal_code: e.target.value,
                          });
                          setFieldError("postal_code", "");
                        }}
                        helperText={fieldErrors.postal_code || ""}
                        error={!!fieldErrors.postal_code}
                      />
                    </div>
                  </div>
                ),
              },
            ]}
            allowMultiple={true}
            iconPosition="right"
            defaultExpanded={[0, 1, 2]}
            variant="filled"
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
                  label="district"
                  value={formData.district}
                  options={districts}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  fullWidth={true}
                />
                <SelectField
                  label="Customer Type"
                  value={formData.customer_type}
                  options={customerTypes}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_type: e.target.value })
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
          data={customers}
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
              onClick: handleEditCustomer,
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
              onClick: handleDeleteCustomer,
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
              onClick: handleViewCustomer,
            },
          ]}
        />
      </div>

      <Dialog
        isOpen={showViewCustomer}
        onClose={() => setShowViewCustomer(false)}
        title="View Customer"
        size="large"
        showFooter={false}
      >
        {viewCustomer && (
          <div align="center" className="space-y-4">
            <div
              label="Customer Details"
              value="aaa"
              className="grid grid-cols-2"
            >
              <p>
                <strong>Name</strong>
              </p>
              <p>
                {[
                  (viewCustomer.first_name || "") +
                    " " +
                    (viewCustomer.last_name || ""),
                ] || ""}
              </p>
              <p>
                <strong>Email</strong>
              </p>
              <p>{viewCustomer.email || ""}</p>
              <p>
                <strong>Phone</strong>
              </p>
              <p>{viewCustomer.phone || ""}</p>
              <p>
                <strong>Whatsapp</strong>
              </p>
              <p>{viewCustomer.whatsapp || ""}</p>
              <p>
                <strong>Address</strong>
              </p>
              <p>
                {[
                  (viewCustomer.addressLine1 || "") +
                    " " +
                    (viewCustomer.addressLine2 || ""),
                ] || ""}
              </p>
              <p>
                <strong>Status</strong>
              </p>
              <p>{viewCustomer.status || ""}</p>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Customers;
