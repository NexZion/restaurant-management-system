/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
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
import { Dialog } from "../../components/Popups";
import MenuItemSearch from "../../components/MenuItemSearch";
import api from "../../axiosClient";
import { getStoredUser } from "../../utils/authStorage";

const formatText = (value) => {
  if (!value) return "N/A";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";

  const amount = Number(value);

  return Number.isNaN(amount) ? value : amount.toFixed(2);
};

const customerName = (customer) => {
  if (!customer) return "Walk-in Customer";

  return (
    `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
    customer.customer_code ||
    "Walk-in Customer"
  );
};

const calculateDiscountAmount = (unitPrice, discountType, discountValue) => {
  const price = Number(unitPrice || 0);
  const discount = Number(discountValue || 0);

  if (!Number.isFinite(price) || price < 0) return 0;
  if (!discountType || discountType === "none") return 0;
  if (discountType === "percent") return (price * discount) / 100;
  if (discountType === "fixed") return discount;

  return 0;
};

export const Orders = () => {
  const [formData, setFormData] = useState({
    id: "",
    date: "",
    customerId: "",
    customerName: "",
    orderType: "dine_in",
    orderNumber: "",
    tableNumber: "",
    seatCount: "",
    menuItem: "",
    attributes: "",
    quantity: "1",
    unitPrice: "",
    discountType: "none",
    discount: "0",
    overallDiscountType: "none",
    overallDiscountAmount: "0",
    status: "pending",
    paymentStatus: "unpaid",
    totalAmount: "",
    notes: "",
  });

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orders, setOrders] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({ status: "" });
  const [showViewOrder, setShowViewOrder] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFormRole, setIsFormRole] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [customerDialogData, setCustomerDialogData] = useState({
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
  const [customerDialogErrors, setCustomerDialogErrors] = useState({});
  const [isCustomerSubmitting, setIsCustomerSubmitting] = useState(false);
  const [isSameAsPhone, setIsSameAsPhone] = useState(false);
  const [isDisabledWhatsapp, setIsDisabledWhatsapp] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);

    try {
      const response = await api.get("/orders");
      const ordersData = response.data.data.map((order) => ({
        id: order.id,
        orderNo: order.order_number,
        customer: customerName(order.customer),
        type: formatText(order.order_type),
        table: order.table?.table_number || order.table?.name || "N/A",
        waiter: order.waiter?.name || "N/A",
        date: formatDate(order.created_at),
        status: formatText(order.status),
        payment: formatText(order.bill?.bill_status || "unpaid"),
        total: formatMoney(order.bill?.grand_total),
        due:
          order.bill?.bill_status === "paid"
            ? formatMoney(0)
            : formatMoney(order.bill?.grand_total),
        rawStatus: order.status || "",
      }));

      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      const payload =
        response?.data?.data?.data ??
        response?.data?.data ??
        response?.data ??
        [];
      const data = Array.isArray(payload) ? payload : [];

      const normalizedCustomers = data.map((customer) => ({
        id: customer.id,
        name:
          [customer.first_name, customer.last_name]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          customer.name ||
          "Walk-in Customer",
        phone: customer.phone || customer.contact_number || "",
      }));

      setCustomers(normalizedCustomers);
      return normalizedCustomers;
    } catch (error) {
      console.error(error);
      setCustomers([]);
      return [];
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get("/menu-items");
      const payload = response?.data?.data ?? [];
      const data = Array.isArray(payload) ? payload : [];

      const normalizedMenuItems = data.map((item) => ({
        id: item.id,
        name: item.name || "Unnamed item",
        image:
          item.images?.[0]?.image_path ||
          item.image ||
          item.image_url ||
          "",
        category: item.menu_category?.name || item.category?.name || "Uncategorized",
        price: Number(item.base_price ?? item.price ?? 0),
      }));

      setMenuItems(normalizedMenuItems);
      return normalizedMenuItems;
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems([]);
      return [];
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchMenuItems();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const list = filters.status
      ? orders.filter((order) => order.rawStatus === filters.status)
      : orders;

    return [...list].sort((a, b) => {
      const left = (a.orderNo || "").toLowerCase();
      const right = (b.orderNo || "").toLowerCase();

      if (left < right) return sortDirection === "asc" ? -1 : 1;
      if (left > right) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filters.status, orders, sortDirection]);

  const orderItemsTotal = useMemo(
    () =>
      orderItems.reduce(
        (sum, item) =>
          sum + Number(item.netPrice || 0),
        0,
      ),
    [orderItems],
  );

  const overallDiscountAmount = useMemo(() => {
    const subtotal = Number(orderItemsTotal || 0);
    const amount = Number(formData.overallDiscountAmount || 0);

    if (!formData.overallDiscountType || formData.overallDiscountType === "none") {
      return 0;
    }

    if (formData.overallDiscountType === "percent") {
      return (subtotal * amount) / 100;
    }

    if (formData.overallDiscountType === "fixed") {
      return amount;
    }

    return 0;
  }, [formData.overallDiscountAmount, formData.overallDiscountType, orderItemsTotal]);

  const orderNetTotal = useMemo(
    () => Math.max(0, Number(orderItemsTotal || 0) - Number(overallDiscountAmount || 0)),
    [orderItemsTotal, overallDiscountAmount],
  );

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      totalAmount: orderNetTotal.toFixed(2),
    }));
  }, [orderNetTotal]);

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

  const handleEditOrder = async (row) => {
    try {
      const response = await api.get(`/orders/${row.id}`);
      const order = response.data.data;

      setEditingOrder(order);
      setIsEditMode(true);
      setFormData({
        id: order.id || "",
        customerName: customerName(order.customer) || "",
        orderNumber: order.order_number || "",
        status: order.status || "pending",
        paymentStatus: order.bill?.bill_status || "unpaid",
        totalAmount: order.bill?.grand_total || "",
        notes: order.notes || "",
      });
      setFieldErrors({});
      setShowAddOrder(true);
    } catch (error) {
      console.error("Error loading order for edit:", error);
    }
  };

  const validateSubmit = () => {
    const errors = {};

    if (!formData.customerId) {
      errors.customerId = "Customer is required.";
    }

    if (!formData.orderNumber.trim()) {
      errors.orderNumber = "Order number is required.";
    }

    if (!formData.totalAmount) {
      errors.totalAmount = "Total amount is required.";
    }

    if (orderItems.length === 0) {
      errors.orderItems = "At least one order item is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetAddOrderForm = () => {
    setFormData({
      id: "",
      date: "",
      customerId: "",
      customerName: "",
      orderType: "dine_in",
      orderNumber: "",
      tableNumber: "",
      seatCount: "",
      menuItem: "",
      attributes: "",
      quantity: "1",
      unitPrice: "",
      discountType: "none",
      discount: "0",
      overallDiscountType: "none",
      overallDiscountAmount: "0",
      status: "pending",
      paymentStatus: "unpaid",
      totalAmount: "",
      notes: "",
    });
    setOrderItems([]);
    setFieldErrors({});
  };

  const resetAddCustomerDialogForm = () => {
    setCustomerDialogData({
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
    setCustomerDialogErrors({});
    setIsSameAsPhone(false);
    setIsDisabledWhatsapp(false);
  };

  const handleCloseAddOrder = () => {
    resetAddOrderForm();
    setShowAddOrder(false);
    setIsEditMode(false);
    setEditingOrder(null);
  };

  const validateCustomerSubmit = () => {
    const errors = {};

    if (!(customerDialogData.first_name || "").trim()) {
      errors.first_name = "First name is required.";
    }

    if (!(customerDialogData.last_name || "").trim()) {
      errors.last_name = "Last name is required.";
    }

    if (!(customerDialogData.id_number || "").trim()) {
      errors.id_number = "ID number is required.";
    }

    if (!(customerDialogData.email || "").trim()) {
      errors.email = "Email is required.";
    }

    if (!customerDialogData.phone) {
      errors.phone = "Phone number is required.";
    }

    if (!customerDialogData.whatsapp) {
      errors.whatsapp = "Whatsapp number is required.";
    }

    setCustomerDialogErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCustomerDialog = async () => {
    if (!validateCustomerSubmit()) return;

    setIsCustomerSubmitting(true);

    const customerPayload = {
      first_name: customerDialogData.first_name,
      last_name: customerDialogData.last_name,
      email: customerDialogData.email,
      phone: customerDialogData.phone,
      whatsapp: customerDialogData.whatsapp,
      id_number: customerDialogData.id_number,
      id_type: customerDialogData.id_type,
      customer_type: customerDialogData.customer_type,
      address_line1: customerDialogData.address_line1,
      address_line2: customerDialogData.address_line2,
      city: customerDialogData.city,
      state: customerDialogData.state,
      district: customerDialogData.district,
      postal_code: customerDialogData.postal_code,
      status: customerDialogData.statusOption,
    };

    try {
      const response = await api.post("/customers", customerPayload);
      const createdCustomer = response?.data?.data?.customer ?? response?.data?.data ?? response?.data ?? null;
      const createdCustomerId = createdCustomer?.id ?? createdCustomer?.customer_id ?? null;

      await fetchCustomers();

      if (createdCustomerId) {
        setFormData((prev) => ({
          ...prev,
          customerId: createdCustomerId,
          customerName:
            `${customerDialogData.first_name || ""} ${customerDialogData.last_name || ""}`.trim() ||
            "Walk-in Customer",
        }));
      }

      resetAddCustomerDialogForm();
      setShowAddCustomerDialog(false);
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setIsCustomerSubmitting(false);
    }
  };

  const handleAddOrderItem = () => {
    const selectedMenuItem = menuItems.find(
      (item) => String(item.id) === String(formData.menuItem),
    );

    if (!selectedMenuItem) {
      setFieldError("menuItem", "Please select a menu item.");
      return;
    }

    const quantity = Number(formData.quantity);
    const unitPrice = Number(formData.unitPrice);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFieldError("quantity", "Quantity must be greater than zero.");
      return;
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      setFieldError("unitPrice", "A valid unit price is required.");
      return;
    }

    const discountAppliedPerUnit = calculateDiscountAmount(
      unitPrice,
      formData.discountType,
      formData.discount,
    );
    const netPrice = (Math.max(0, unitPrice - discountAppliedPerUnit))*quantity;

    const newOrderItem = {
      id: `${selectedMenuItem.id}-${Date.now()}`,
      itemId: selectedMenuItem.id,
      image: selectedMenuItem.image,
      name: selectedMenuItem.name,
      category: selectedMenuItem.category || "Uncategorized",
      quantity,
      unitPrice,
      discountAppliedPerUnit,
      netPrice,
    };

    const updatedOrderItems = [...orderItems, newOrderItem];
    const updatedTotal = updatedOrderItems.reduce(
      (sum, item) => sum + Number(item.netPrice || 0),
      0,
    );

    setOrderItems(updatedOrderItems);
    setFormData((prev) => ({
      ...prev,
      menuItem: "",
      attributes: "",
      quantity: "1",
      unitPrice: "",
      discountType: "none",
      discount: "0",
      totalAmount: updatedTotal.toFixed(2),
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.menuItem;
      delete next.quantity;
      delete next.unitPrice;
      return next;
    });
  };

  const handleRemoveOrderItem = (itemId) => {
    const updatedOrderItems = orderItems.filter((item) => item.id !== itemId);
    setOrderItems(updatedOrderItems);
    setFormData((prev) => ({
      ...prev,
      totalAmount: updatedOrderItems
        .reduce((sum, item) => sum + Number(item.netPrice || 0), 0)
        .toFixed(2),
    }));
  };

  const handleSubmitOrder = async () => {
    if (!validateSubmit()) return;

    setIsSubmitting(true);

    const currentUser = getStoredUser();
    const branchId = currentUser?.branch_id || currentUser?.branch?.id || null;
    const subtotal = Number(orderItemsTotal || 0);
    const orderDiscountAmount =
      formData.overallDiscountType === "percent"
        ? (subtotal * Number(formData.overallDiscountAmount || 0)) / 100
        : formData.overallDiscountType === "fixed"
          ? Number(formData.overallDiscountAmount || 0)
          : 0;
    const netTotal = Math.max(0, subtotal - orderDiscountAmount);

    const payload = {
      branch_id: branchId,
      order_number: formData.orderNumber.trim(),
      customer_id: formData.customerId || null,
      customer_name: formData.customerName || "",
      order_type: formData.orderType === "dine_in" ? "dining" : formData.orderType,
      table_id: formData.tableNumber && /^\d+$/.test(formData.tableNumber)
        ? Number(formData.tableNumber)
        : null,
      status: formData.status,
      is_online: false,
      notes: formData.notes,
      items: orderItems.map((item) => ({
        menu_item_id: item.itemId,
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.unitPrice || 0),
        discount: Number(item.discountAppliedPerUnit || 0),
        total_price: Number(item.netPrice || 0),
        notes: item.notes || null,
      })),
      bill: {
        subtotal,
        discount: orderDiscountAmount,
        tax: 0,
        service_charge: 0,
        grand_total: netTotal,
        bill_status: formData.paymentStatus || "unpaid",
      },
    };

    try {
      if (isEditMode && editingOrder?.id) {
        await api.put(`/orders/${editingOrder.id}`, payload);
      } else {
        await api.post("/orders", payload);
      }

      setIsEditMode(false);
      resetAddOrderForm();
      fetchOrders();
      setShowAddOrder(false);
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (row) => {
    try {
      await api.delete(`/orders/${row.id}`);
      fetchOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  const handleViewOrder = async (row) => {
    try {
      const response = await api.get(`/orders/${row.id}`);
      setViewOrder(response.data.data);
      setShowViewOrder(true);
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  const status = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "served", label: "Served" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const orderTypes = [
    { value: "dine_in", label: "Dine In" },
    { value: "takeaway", label: "Takeaway" },
    { value: "delivery", label: "Delivery" },
  ];

  const tables = [
    { value: "T1", label: "Table 1" },
    { value: "T2", label: "Table 2" },
    { value: "T3", label: "Table 3" },
  ];

  const customerTypes = [
    { value: "regular", label: "Normal Customer" },
    { value: "corporate", label: "Corporate Customer" },
    { value: "vip", label: "VIP Customer" },
  ];

  const customerStatusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  const customerIdTypes = [
    { value: "nic", label: "NIC" },
    { value: "passport", label: "Passport" },
  ];

  const customerDistricts = [
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

  const discountTypes = [
    { value: "none", label: "No Discount" },
    { value: "percent", label: "Percentage" },
    { value: "fixed", label: "Fixed Amount" },
  ];

  const columns = [
    { key: "orderNo", label: "Order No", sortable: true },
    { key: "customer", label: "Customer", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "status", label: "Status" },
    { key: "payment", label: "Payment" },
    { key: "total", label: "Total" },
    { key: "due", label: "Due" },
  ];

  const orderSummary = viewOrder
    ? [
        { label: "Order Type", value: formatText(viewOrder.order_type) },
        { label: "Date", value: formatDate(viewOrder.created_at) },
        { label: "Branch", value: viewOrder.branch?.name },
        {
          label: "Table",
          value: viewOrder.table?.table_number || viewOrder.table?.name,
        },
        { label: "Waiter", value: viewOrder.waiter?.name },
        { label: "Created By", value: viewOrder.creator?.name },
        { label: "Notes", value: viewOrder.notes, wide: true },
      ]
    : [];

  const billSummary = viewOrder
    ? [
        {
          label: "Payment Status",
          value: formatText(viewOrder.bill?.bill_status || "unpaid"),
        },
        {
          label: "Grand Total",
          value: formatMoney(viewOrder.bill?.grand_total),
        },
      ]
    : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
          Orders
        </h1>
        <Button
          variant="primary"
          onClick={() => {
            setIsFormRole(true);
            setShowAddOrder(true);
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
          Add Order
        </Button>
      </div>

      <Accordion
        items={[
          {
            title: "Additional Search",
            content: (
              <div className="grid w-full grid-cols-3 gap-4">
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
          data={filteredOrders}
          selectable={false}
          expandable={false}
          searchable={true}
          filterable={false}
          loading={isLoading}
          emptyMessage="No orders found"
          customButtons={[
            <button
              key="sort"
              type="button"
              onClick={() =>
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="flex items-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
              {sortDirection === "asc" ? "Sort A-Z" : "Sort Z-A"}
            </button>,
          ]}
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
              onClick: handleEditOrder,
            },
            {
              icon: (
                <svg
                  className="h-5 w-5"
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
              onClick: handleDeleteOrder,
            },
            {
              icon: (
                <svg
                  className="h-5 w-5"
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
              onClick: handleViewOrder,
            },
          ]}
        />
      </div>

      <Dialog
        isOpen={showAddOrder}
        onClose={handleCloseAddOrder}
        title={isEditMode ? "Edit Order" : "Add Order"}
        size="large"
        primaryButtonText={
          isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"
        }
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isSubmitting}
        secondaryButtonDisabled={isSubmitting}
        onPrimaryButtonClick={handleSubmitOrder}
        onSecondaryButtonClick={handleCloseAddOrder}
      >
        <Accordion
          items={[
            {
              title: "Order Details",
              content: (
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField
                      label="Order Date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        setFieldError("date", "");
                      }}
                      helperText={fieldErrors.date || ""}
                      error={!!fieldErrors.date}
                    />

                    <SelectField
                      label="Order Type"
                      value={formData.orderType}
                      options={orderTypes}
                      onChange={(e) =>
                        setFormData({ ...formData, orderType: e.target.value })
                      }
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="grid gap-4 md:grid-cols-[2fr_auto_1fr] items-end">
                    <SelectField
                      label="Customer"
                      //placeholder="Search Customer..."
                      searchable
                      value={formData.customerId || ""}
                      options={customers.map((customer) => ({
                        value: customer.id,
                        label: `${customer.name}${customer.phone ? ` (${customer.phone})` : ""}`,
                      }))}
                      helperText={fieldErrors.customerId || ""}
                      error={!!fieldErrors.customerId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerId: e.target.value,
                        })
                      }
                    />

                    <Button
                      variant="secondary"
                      className="h-[42px] px-4 whitespace-nowrap"
                      onClick={() => {
                        resetAddCustomerDialogForm();
                        setShowAddCustomerDialog(true);
                      }}
                    >
                      Add Customer
                    </Button>

                    <SelectField
                      label="Table"
                      value={formData.tableNumber}
                      options={tables}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tableNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ),
            },
            {
              title: "Menu & Attributes",
              content: (
                <div className="space-y-4">
                  <MenuItemSearch
                    label="Menu Item"
                    items={menuItems}
                    value={formData.menuItem}
                    onChange={(item) =>
                      setFormData((prev) => ({
                        ...prev,
                        menuItem: item?.id ?? "",
                        unitPrice: item?.price ? String(item.price) : "",
                      }))
                    }
                  />
                  <div className="rounded border border-dashed border-gray-300 p-4 dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Attributes Loader
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Select a menu item to load its available attributes here.
                    </p>
                  </div>
                  <div className="grid w-full gap-4 md:grid-cols-2">
                    <TextField
                      label="Quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => {
                        setFormData({ ...formData, quantity: e.target.value });
                        setFieldError("quantity", "");
                      }}
                    />
                    <TextField
                      label="Unit Price"
                      type="number"
                      value={formData.unitPrice}
                      disabled={!formData.menuItem}
                      onChange={(e) => {
                        setFormData({ ...formData, unitPrice: e.target.value });
                        setFieldError("unitPrice", "");
                      }}
                    />
                    <SelectField
                      label="Item Discount Type"
                      value={formData.discountType}
                      options={discountTypes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="Item Discount Amount"
                      type="number"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({ ...formData, discount: e.target.value })
                      }
                    />
                    <div className="flex items-end justify-end md:col-span-2">
                      <Button variant="primary" onClick={handleAddOrderItem}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-[#202024]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Order Items
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Added items appear here instantly.
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                        {orderItems.length} item{orderItems.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {orderItems.length === 0 ? (
                      <div className="rounded border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                        No menu items added yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              <th className="px-2 py-1">Item</th>
                              <th className="px-2 py-1">Category</th>
                              <th className="px-2 py-1">Quantity</th>
                              <th className="px-2 py-1">Unit Price</th>
                              <th className="px-2 py-1">Discount / Unit</th>
                              <th className="px-2 py-1">Net Price</th>
                              <th className="px-2 py-1 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderItems.map((item) => (
                              <tr
                                key={item.id}
                                className="rounded-lg bg-white text-gray-900 shadow-sm dark:bg-[#18181B] dark:text-white"
                              >
                                <td className="rounded-l-lg px-2 py-2">
                                  <div className="flex items-center gap-3">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-10 w-10 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-500 text-xs font-bold text-white">
                                        {item.name?.slice(0, 2)?.toUpperCase() || "IT"}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold">{item.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-gray-700 dark:text-gray-300">
                                  {item.category}
                                </td>
                                <td className="px-2 py-2 text-gray-700 dark:text-gray-300">
                                  {item.quantity}
                                </td>
                                <td className="px-2 py-2 text-gray-700 dark:text-gray-300">
                                  {formatMoney(item.unitPrice)}
                                </td>
                                <td className="px-2 py-2 text-gray-700 dark:text-gray-300">
                                  {formatMoney(item.discountAppliedPerUnit)}
                                </td>
                                <td className="px-2 py-2 text-gray-700 dark:text-gray-300">
                                  {formatMoney(item.netPrice)}
                                </td>
                                <td className="rounded-r-lg px-2 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOrderItem(item.id)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-lg font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                                    aria-label="Remove item"
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Order Items Total
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatMoney(orderItemsTotal)}
                      </span>
                    </div>

                    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#18181B]">
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Apply Order Discount
                        </h4>
                      </div>

                      <div className="grid w-full gap-4 md:grid-cols-2">
                        <SelectField
                          label="Discount Type"
                          value={formData.overallDiscountType}
                          options={discountTypes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              overallDiscountType: e.target.value,
                            })
                          }
                        />
                        <TextField
                          label="Discount Amount"
                          type="number"
                          value={formData.overallDiscountAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              overallDiscountAmount: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 text-sm dark:border-gray-700">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Net Total
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatMoney(orderNetTotal)}
                        </span>
                      </div>
                    </div>
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

      <Dialog
        isOpen={showAddCustomerDialog}
        onClose={() => {
          resetAddCustomerDialogForm();
          setShowAddCustomerDialog(false);
        }}
        title="Add Customer"
        size="large"
        primaryButtonText={isCustomerSubmitting ? "Saving..." : "Save"}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={isCustomerSubmitting}
        secondaryButtonDisabled={isCustomerSubmitting}
        onPrimaryButtonClick={handleSubmitCustomerDialog}
        onSecondaryButtonClick={() => {
          resetAddCustomerDialogForm();
          setShowAddCustomerDialog(false);
        }}
      >
        <Accordion
          items={[
            {
              title: "Basic Information",
              content: (
                <div className="grid w-full grid-cols-2 gap-4 pb-4">
                  <SelectField
                    label="Customer Type"
                    value={customerDialogData.customer_type}
                    options={customerTypes}
                    onChange={(e) => {
                      setCustomerDialogData({
                        ...customerDialogData,
                        customer_type: e.target.value,
                      });
                      setCustomerDialogErrors((prev) => ({
                        ...prev,
                        customer_type: "",
                      }));
                    }}
                    helperText={customerDialogErrors.customer_type || ""}
                    error={!!customerDialogErrors.customer_type}
                  />
                  <SelectField
                    label="Status"
                    value={customerDialogData.statusOption}
                    options={customerStatusOptions}
                    onChange={(e) =>
                      setCustomerDialogData({
                        ...customerDialogData,
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
                <div className="grid w-full grid-cols-2 gap-4 pb-4">
                  <TextField
                    required
                    label="First Name"
                    value={customerDialogData.first_name}
                    onChange={(e) => {
                      setCustomerDialogData({
                        ...customerDialogData,
                        first_name: e.target.value,
                      });
                      setCustomerDialogErrors((prev) => ({
                        ...prev,
                        first_name: "",
                      }));
                    }}
                    helperText={customerDialogErrors.first_name || ""}
                    error={!!customerDialogErrors.first_name}
                  />
                  <TextField
                    required
                    label="Last Name"
                    value={customerDialogData.last_name}
                    onChange={(e) => {
                      setCustomerDialogData({
                        ...customerDialogData,
                        last_name: e.target.value,
                      });
                      setCustomerDialogErrors((prev) => ({
                        ...prev,
                        last_name: "",
                      }));
                    }}
                    helperText={customerDialogErrors.last_name || ""}
                    error={!!customerDialogErrors.last_name}
                  />
                  <SelectField
                    label="ID Type"
                    value={customerDialogData.id_type}
                    options={customerIdTypes}
                    onChange={(e) => {
                      setCustomerDialogData({
                        ...customerDialogData,
                        id_type: e.target.value,
                      });
                      setCustomerDialogErrors((prev) => ({
                        ...prev,
                        id_type: "",
                      }));
                    }}
                    helperText={customerDialogErrors.id_type || ""}
                    error={!!customerDialogErrors.id_type}
                  />
                  <TextField
                    label="ID Number"
                    value={customerDialogData.id_number}
                    onChange={(e) => {
                      setCustomerDialogData({
                        ...customerDialogData,
                        id_number: e.target.value,
                      });
                      setCustomerDialogErrors((prev) => ({
                        ...prev,
                        id_number: "",
                      }));
                    }}
                    helperText={customerDialogErrors.id_number || ""}
                    error={!!customerDialogErrors.id_number}
                  />
                  <TextField
                    required
                    fullWidth={true}
                    label="Email"
                    type="email"
                    value={customerDialogData.email}
                    onChange={(e) => {
                      setCustomerDialogData({
                        ...customerDialogData,
                        email: e.target.value,
                      });
                      setCustomerDialogErrors((prev) => ({
                        ...prev,
                        email: "",
                      }));
                    }}
                    helperText={customerDialogErrors.email || ""}
                    error={!!customerDialogErrors.email}
                  />
                  <PhoneField
                    required
                    label="Phone Number"
                    defaultCode="+94"
                    value={customerDialogData.phone}
                    onChange={(value) => {
                      setCustomerDialogData({
                        ...customerDialogData,
                        phone: value,
                      });
                      setCustomerDialogErrors((prev) => ({
                        ...prev,
                        phone: "",
                      }));
                    }}
                    fullWidth
                    helperText={customerDialogErrors.phone || ""}
                    error={!!customerDialogErrors.phone}
                  />
                  <PhoneField
                    required
                    label="Whatsapp Number"
                    defaultCode="+94"
                    disabled={isDisabledWhatsapp}
                    value={customerDialogData.whatsapp}
                    onChange={(value) => {
                      setCustomerDialogData({
                        ...customerDialogData,
                        whatsapp: value,
                      });
                      setCustomerDialogErrors((prev) => ({
                        ...prev,
                        whatsapp: "",
                      }));
                    }}
                    fullWidth
                    helperText={customerDialogErrors.whatsapp || ""}
                    error={!!customerDialogErrors.whatsapp}
                  />
                  <CheckboxField
                    label="Same as Phone Number"
                    checked={isSameAsPhone}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setIsSameAsPhone(true);
                        setCustomerDialogData({
                          ...customerDialogData,
                          whatsapp: customerDialogData.phone,
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
                <div className="space-y-4">
                  <TextField
                    label="Address Line 1"
                    value={customerDialogData.address_line1}
                    onChange={(e) => {
                      setCustomerDialogData({
                        ...customerDialogData,
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
                    value={customerDialogData.address_line2}
                    onChange={(e) => {
                      setCustomerDialogData({
                        ...customerDialogData,
                        address_line2: e.target.value,
                      });
                    }}
                    rows={1}
                    className="mb-4"
                    resize="vertical"
                    maxLength={50}
                  />
                  <div className="grid w-full grid-cols-2 gap-4 pb-4">
                    <TextField
                      label="City"
                      value={customerDialogData.city}
                      onChange={(e) => {
                        setCustomerDialogData({
                          ...customerDialogData,
                          city: e.target.value,
                        });
                      }}
                    />
                    <TextField
                      label="State"
                      value={customerDialogData.state}
                      onChange={(e) => {
                        setCustomerDialogData({
                          ...customerDialogData,
                          state: e.target.value,
                        });
                      }}
                    />
                    <SelectField
                      label="District"
                      value={customerDialogData.district}
                      options={customerDistricts}
                      onChange={(e) => {
                        setCustomerDialogData({
                          ...customerDialogData,
                          district: e.target.value,
                        });
                      }}
                    />
                    <TextField
                      label="Postal Code"
                      value={customerDialogData.postal_code}
                      onChange={(e) => {
                        setCustomerDialogData({
                          ...customerDialogData,
                          postal_code: e.target.value,
                        });
                      }}
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

      <Dialog
        isOpen={showViewOrder}
        onClose={() => setShowViewOrder(false)}
        title="Order Details"
        size="medium"
        showFooter={false}
      >
        {viewOrder && (
          <div className="space-y-6">
            <div className="rounded border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-[#202024]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-950 dark:text-white">
                    {viewOrder.order_number || "N/A"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {customerName(viewOrder.customer)}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                  {formatText(viewOrder.status)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {orderSummary.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-[#202024] ${
                      item.wide ? "sm:col-span-2" : ""
                    }`}
                  >
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Bill
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {billSummary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-[#202024]"
                  >
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Orders;
