// Menu items data
export const menuItems = [
  { type: 'item', name: 'components (Remove Later)', path: '/components', icon: 'components' },
  { type: 'item', name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { type: 'item', name: 'Analytics', path: '/analytics', icon: 'analytics' },
  // { type: 'item', name: 'AI Gen', path: '/ai', icon: 'ai' },
  
  { 
    type: 'group', 
    name: 'Product',
    icon: 'product',
    items: [
      { name: 'Products', path: '/product/products' },
      { name: 'Categories', path: '/product/categories' },
    ]
  },
  { 
    type: 'group', 
    name: 'Raw Materials',
    icon: 'raw_materials',
    items: [
      { name: 'Materials', path: '/raw-materials/materials' },
      { name: 'Inventory', path: '/raw-materials/inventory' },
      { name: 'GRN', path: '/raw-materials/grn' },
    ]
  },
  { type: 'group', name: 'Sales Orders',
    icon: 'orders',
    items: [
      { name: 'Sales Order', path: '/sales-orders/sales-order' },
      { name: 'Bulk Orders', path: '/sales-orders/bulk-orders' }, 
      { name: 'Payments', path: '/sales-orders/payments' },
      { name: 'Returns', path: '/sales-orders/returns' },
    ]
  },
  // { 
  //   type: 'group', 
  //   name: 'Orders',
  //   icon: 'orders',
  //   items: [
  //     { name: 'All Orders', path: '/orders/all' },
  //     { name: 'Pending', path: '/orders/pending' },
  //     { name: 'Completed', path: '/orders/completed' },
  //   ]
  // },
  { 
    type: 'group', 
    name: 'Orders',
    icon: 'orders',
    items: [
      { name: 'Orders', path: '/Orders/Orders' },
      { name: 'Payments', path: '/Orders/Payments' },
    ]
  },
  { type: 'item', name: 'Customers', path: '/customers', icon: 'customers' },
  { 
    type: 'group', 
    name: 'Reports',
    icon: 'reports',
    items: [
      { name: 'Sales Report', path: '/reports/sales' },
      { name: 'Inventory Report', path: '/reports/inventory' },
      { name: 'Financial Report', path: '/reports/financial' },
    ]
  },
  { type: 'item', name: 'Users', path: '/users', icon: 'users' },
];
