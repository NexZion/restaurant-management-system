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

export const Customers = () => {
  const [formData, setFormData] = useState({
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
    customer_type: "regular",
    id_number: "",
    id_type: "nic",
    statusOption: "active",
  });

  const [filterData, setFilterData] = useState({
    district: "all",
    customer_type: "all",
    statusOption: "all",
  });

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [isSameAsPhone, setIsSameAsPhone] = useState(false);
  const [isDisabledWhatsapp, setIsDisabledWhatsapp] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showViewCustomer, setShowViewCustomer] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);

  const fetchCustomers = async () => {
    setIsCustomersLoading(true);
    try {
      const response = await api.get("/customers", {
        params: {
          district: filterData.district,
          customer_type: filterData.customer_type,
          status: filterData.statusOption,
        },
      });
      console.log("Fetched customers:", response);
      const customerData = response.data.data.map((customer) => ({
        id: customer.id,
        created_at: customer.created_at,
        name: `${customer.first_name} ${customer.last_name}`,
        customer_type: customer.customer_type,
        district: customer.district,
        phone: customer.phone,
        status: customer.status || "N/A",
        statusOption: customer.status
          ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1)
          : "N/A",
        statusChip: <Chip status={customer.status || "N/A"} size="small" />,
        customer_code: customer.customer_code,
      }));
      setCustomers(customerData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filterData]);

  const districts = [
    { value: "all", label: "All Districts" },
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
    { value: "all", label: "All Types" },
    { value: "regular", label: "Normal Customer" },
    { value: "corporate", label: "Corporate Customer" },
    { value: "vip", label: "VIP Customer" },
  ];

  const status = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  const idTypes = [
    { value: "nic", label: "NIC" },
    { value: "passport", label: "Passport" },
  ];

  const columns = [
    { key: "customer_code", label: "Customer Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "customer_type", label: "Customer Type", sortable: true },
    { key: "district", label: "District" },
    { key: "phone", label: "Phone" },
    { key: "statusChip", label: "Status" },
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
        customer_type: customer.customer_type || "regular",
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
      customer_type: "regular",
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

  const handleDeleteCustomer = (row) => {
    setCustomerToDelete(row);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;

    setIsDeletingCustomer(true);
    try {
      await api.delete(`/customers/${customerToDelete.id}`);
      await fetchCustomers();
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Failed to delete customer:", error);
    } finally {
      setIsDeletingCustomer(false);
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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-[#F7F8F8]">
            Customers
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#8A8F98]">
            Keep customer profiles and contact details up to date.
          </p>
        </div>

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
          size="medium"
          primaryButtonText={
            isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"
          }
          secondaryButtonText="Cancel"
          primaryButtonDisabled={isSubmitting}
          secondaryButtonDisabled={isSubmitting}
          onPrimaryButtonClick={handleSubmitCustomer}
          onSecondaryButtonClick={handleCloseAddCustomer}
        >

          <div className="grid grid-cols-2 gap-3.5 w-full pb-4">
            <SelectField
              label="Customer Type"
              value={formData.customer_type}
              options={customerTypes.filter((option) => option.value !== "all")}
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
          <div className="grid grid-cols-2 gap-3.5 w-full pb-4">
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
            <div className="grid grid-cols-2 gap-3.5 w-full pb-4">
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
                searchable={true}
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
        </Dialog>
      </div>
      <Accordion
        items={[
          {
            title: "Additional Search",
            content: (
              <div className="grid grid-cols-1 items-end gap-3.5 w-full md:grid-cols-7">
                <SelectField
                  label="District"
                  className="md:col-span-2"
                  value={filterData.district}
                  options={districts}
                  searchable={true}
                  onChange={(e) =>
                    setFilterData({ ...filterData, district: e.target.value })
                  }
                  fullWidth={true}
                />
                <SelectField
                  label="Customer Type"
                  className="md:col-span-2"
                  value={filterData.customer_type}
                  options={customerTypes}
                  onChange={(e) =>
                    setFilterData({ ...filterData, customer_type: e.target.value })
                  }
                  fullWidth={true}
                />
                <SelectField
                  label="Status"
                  className="md:col-span-2"
                  value={filterData.statusOption}
                  options={status}
                  onChange={(e) =>
                    setFilterData({ ...filterData, statusOption: e.target.value })
                  }
                  fullWidth={true}
                />
                <Button
                  variant="secondary"
                  width="100%"
                  onClick={() =>
                    setFilterData({
                      district: "all",
                      customer_type: "all",
                      statusOption: "all",
                    })
                  }
                >
                  Clear filters
                </Button>
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
          loading={isCustomersLoading}
          sortSelectOptions={[
            {
              value: "latest",
              label: "Latest added",
              key: "created_at",
              direction: "desc",
            },
            {
              value: "oldest",
              label: "Oldest added",
              key: "created_at",
              direction: "asc",
            },
            {
              value: "name_asc",
              label: "Name (A–Z)",
              key: "name",
              direction: "asc",
            },
            {
              value: "name_desc",
              label: "Name (Z–A)",
              key: "name",
              direction: "desc",
            },
          ]}
          sortSelectValue="latest"
          sortSelectPlaceholder="Sort customers"
          onRowClick={handleViewCustomer}
          actionsAlign="right"
          showActionsHeader={false}
          actions={(row) => [
            {
              label: "Customer actions",
              render: () => (
                <ActionMenu
                  label={`Actions for ${row.name || "customer"}`}
                  items={[
                    {
                      label: "Edit customer",
                      onClick: () => handleEditCustomer(row),
                    },
                    {
                      label: "Delete customer",
                      variant: "danger",
                      onClick: () => handleDeleteCustomer(row),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>

      <Dialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        title="Delete Customer"
        size="small"
        primaryButtonText={isDeletingCustomer ? "Deleting..." : "Delete"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isDeletingCustomer}
        secondaryButtonDisabled={isDeletingCustomer}
        onPrimaryButtonClick={confirmDeleteCustomer}
        onSecondaryButtonClick={() => setCustomerToDelete(null)}
      >
        <div className="space-y-2">
          <p>
            Are you sure you want to delete {customerToDelete?.name || "this customer"}?
          </p>
          <p>They will be removed from the customer list.</p>
        </div>
      </Dialog>

      <Dialog
        isOpen={showViewCustomer}
        onClose={() => setShowViewCustomer(false)}
        title="Customer Profile"
        size="medium"
        showFooter={false}
      >
        {viewCustomer && (
          <ProfileView
            title={
              `${viewCustomer.first_name || ""} ${viewCustomer.last_name || ""}`.trim() ||
              "Not provided"
            }
            subtitle={viewCustomer.customer_code || "No customer code"}
            avatarAlt="Customer"
            showAvatar={false}
            badges={[
              { value: viewCustomer.customer_type, tone: "default" },
              { value: viewCustomer.status },
            ]}
            highlights={[
              { label: "Email", value: viewCustomer.email },
              { label: "Phone", value: viewCustomer.phone },
              { label: "Whatsapp", value: viewCustomer.whatsapp },
            ]}
            sections={[
              {
                title: "Contact Details",
                items: [
                  { label: "Email", value: viewCustomer.email },
                  { label: "Phone", value: viewCustomer.phone },
                  { label: "Whatsapp", value: viewCustomer.whatsapp },
                  { label: "Customer Type", value: viewCustomer.customer_type },
                ],
              },
              {
                title: "Personal Details",
                items: [
                  { label: "First Name", value: viewCustomer.first_name },
                  { label: "Last Name", value: viewCustomer.last_name },
                  { label: "ID Type", value: viewCustomer.id_type },
                  { label: "ID Number", value: viewCustomer.id_number },
                ],
              },
              {
                title: "Address",
                items: [
                  {
                    label: "Address Line 1",
                    value: viewCustomer.address_line1,
                    wide: true,
                  },
                  {
                    label: "Address Line 2",
                    value: viewCustomer.address_line2,
                    wide: true,
                  },
                  { label: "City", value: viewCustomer.city },
                  { label: "District", value: viewCustomer.district },
                  { label: "State", value: viewCustomer.state },
                  { label: "Postal Code", value: viewCustomer.postal_code },
                ],
              },
            ]}
          />
        )}
      </Dialog>
    </div>
  );
};

export default Customers;
