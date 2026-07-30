import { ACCESS_LEVELS as L } from "../utils/accessControl";

export const menuItems = [
  { type: "item", name: "Dashboard", path: "/dashboard", icon: "dashboard", allowedLevels: [L.VIEWER, L.RECEPTION, L.ACCOUNTANT] },
  {
    type: "group", name: "Point of Sale", icon: "orders",
    items: [
      { name: "New Order", path: "/pos/new-order", allowedLevels: [L.WAITER] },
      { name: "Cashier Billing", path: "/pos/billing", allowedLevels: [L.CASHIER] },
      { name: "Cashier Shifts", path: "/pos/cashier-shifts", allowedLevels: [L.CASHIER] },
    ],
  },
  {
    type: "group", name: "Orders", icon: "orders",
    items: [
      { name: "All Orders", path: "/orders", allowedLevels: [L.WAITER, L.CASHIER] },
      { name: "Payments", path: "/billing/payments", allowedLevels: [L.CASHIER, L.ACCOUNTANT] },
      { name: "Refunds", path: "/billing/refunds", allowedLevels: [L.CASHIER, L.ACCOUNTANT] },
      { name: "Deliveries", path: "/orders/deliveries", allowedLevels: [L.WAITER, L.CASHIER] },
      { name: "Discounts", path: "/orders/discounts", allowedLevels: [L.CASHIER, L.ACCOUNTANT] },
    ],
  },
  {
    type: "group", name: "Customers", icon: "customers",
    items: [
      { name: "Customers", path: "/customers", allowedLevels: [L.RECEPTION, L.WAITER] },
      { name: "Addresses", path: "/customers/addresses", allowedLevels: [L.RECEPTION, L.WAITER] },
      { name: "Loyalty History", path: "/customers/loyalty-transactions", allowedLevels: [L.RECEPTION, L.ACCOUNTANT] },
    ],
  },
  {
    type: "group", name: "Restaurant", icon: "product",
    items: [
      { name: "Reservations", path: "/restaurant/reservations", allowedLevels: [L.RECEPTION, L.WAITER] },
      { name: "Reservation Tables", path: "/restaurant/reservation-tables", allowedLevels: [L.RECEPTION, L.WAITER] },
      { name: "Reservation Deposits", path: "/restaurant/reservation-deposits", allowedLevels: [L.RECEPTION, L.ACCOUNTANT] },
      { name: "Table Sessions", path: "/restaurant/table-sessions", allowedLevels: [L.RECEPTION, L.WAITER] },
      { name: "Tables", path: "/restaurant/tables", allowedLevels: [L.RECEPTION, L.WAITER] },
      { name: "Floors", path: "/restaurant/floors", allowedLevels: [L.RECEPTION] },
      { name: "Sections", path: "/restaurant/sections", allowedLevels: [L.RECEPTION] },
    ],
  },
  {
    type: "group", name: "Kitchen", icon: "menu",
    items: [
      { name: "Kitchen Display", path: "/kitchen/display", allowedLevels: [L.KITCHEN] },
      { name: "Kitchen Tickets", path: "/kitchen/tickets", allowedLevels: [L.KITCHEN] },
      { name: "Kitchen Stations", path: "/kitchen/stations", allowedLevels: [L.KITCHEN] },
    ],
  },
  {
    type: "group", name: "Menu Management", icon: "menu",
    items: [
      { name: "Menus", path: "/menu/menus", allowedLevels: [L.INVENTORY] },
      { name: "Menu Items", path: "/menu/menu-items", allowedLevels: [L.INVENTORY] },
      { name: "Categories", path: "/menu/menu-categories", allowedLevels: [L.INVENTORY] },
      { name: "Variants", path: "/menu/variants", allowedLevels: [L.INVENTORY] },
      { name: "Attributes", path: "/menu/attributes", allowedLevels: [L.INVENTORY] },
      { name: "Attribute Values", path: "/menu/attribute-values", allowedLevels: [L.INVENTORY] },
      { name: "Modifier Groups", path: "/menu/modifier-groups", allowedLevels: [L.INVENTORY] },
      { name: "Modifier Options", path: "/menu/modifier-options", allowedLevels: [L.INVENTORY] },
      { name: "Recipes", path: "/menu/recipes", allowedLevels: [L.INVENTORY] },
      { name: "Branch Availability", path: "/menu/branch-availability", allowedLevels: [L.INVENTORY] },
      { name: "Item Images", path: "/menu/item-images", allowedLevels: [L.INVENTORY] },
      { name: "Variant Attributes", path: "/menu/variant-attributes", allowedLevels: [L.INVENTORY] },
      { name: "Item Modifiers", path: "/menu/item-modifier-groups", allowedLevels: [L.INVENTORY] },
      { name: "Recipe Ingredients", path: "/menu/recipe-ingredients", allowedLevels: [L.INVENTORY] },
    ],
  },
  {
    type: "group", name: "Inventory", icon: "inventory",
    items: [
      { name: "Inventory Items", path: "/inventory/items", allowedLevels: [L.INVENTORY] },
      { name: "Stock Levels", path: "/inventory/stock-levels", allowedLevels: [L.INVENTORY] },
      { name: "Stock Movements", path: "/inventory/stock-movements", allowedLevels: [L.INVENTORY] },
      { name: "Wastage", path: "/inventory/wastage", allowedLevels: [L.INVENTORY] },
    ],
  },
  {
    type: "group", name: "Purchasing", icon: "raw_materials",
    items: [
      { name: "Suppliers", path: "/purchasing/suppliers", allowedLevels: [L.INVENTORY] },
      { name: "Purchase Orders", path: "/purchasing/purchase-orders", allowedLevels: [L.INVENTORY] },
      { name: "Purchase Order Items", path: "/purchasing/purchase-order-items", allowedLevels: [L.INVENTORY] },
      { name: "Receive Stock", path: "/purchasing/receiving", allowedLevels: [L.INVENTORY] },
    ],
  },
  {
    type: "group", name: "Sales Setup", icon: "analytics",
    items: [
      { name: "Promotions", path: "/sales/promotions", allowedLevels: [L.ACCOUNTANT] },
      { name: "Coupons", path: "/sales/coupons", allowedLevels: [L.ACCOUNTANT] },
      { name: "Taxes", path: "/sales/taxes", allowedLevels: [L.ACCOUNTANT] },
    ],
  },
  {
    type: "group", name: "Accounting", icon: "reports",
    items: [
      { name: "Chart of Accounts", path: "/accounting/accounts", allowedLevels: [L.ACCOUNTANT] },
      { name: "Journal Entries", path: "/accounting/journal-entries", allowedLevels: [L.ACCOUNTANT] },
      { name: "Payment Methods", path: "/settings/payment-methods", allowedLevels: [L.ACCOUNTANT] },
    ],
  },
  {
    type: "group", name: "Administration", icon: "users",
    items: [
      { name: "Users", path: "/administration/users", allowedLevels: [L.SUPER_ADMIN] },
      { name: "Roles", path: "/administration/roles", allowedLevels: [L.SUPER_ADMIN] },
      { name: "Permissions", path: "/administration/permissions", allowedLevels: [L.ADMIN, L.SUPER_ADMIN] },
      { name: "Branches", path: "/administration/branches", allowedLevels: [L.ADMIN, L.SUPER_ADMIN] },
      { name: "Audit Logs", path: "/administration/audit-logs", allowedLevels: [L.ADMIN, L.SUPER_ADMIN] },
      { name: "Reason Codes", path: "/settings/reason-codes", allowedLevels: [L.ADMIN, L.SUPER_ADMIN] },
      { name: "Document Sequences", path: "/settings/document-sequences", allowedLevels: [L.ADMIN, L.SUPER_ADMIN] },
    ],
  },
  {
    type: "group", name: "Devices", icon: "settings",
    items: [
      { name: "POS Terminals", path: "/settings/pos-terminals", allowedLevels: [L.CASHIER] },
      { name: "Printers", path: "/settings/printers", allowedLevels: [L.KITCHEN] },
    ],
  },
];
