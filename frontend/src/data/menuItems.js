// Menu items data
export const menuItems = [
  { type: 'item', name: 'components (Remove Later)', path: '/components', icon: 'components' },
  { type: 'item', name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  // { type: 'item', name: 'AI Gen', path: '/ai', icon: 'ai' },

  {
    type: 'group',
    name: 'Raw Materials',
    icon: 'raw_materials',
    items: [
      { name: 'Materials', path: '/raw-materials/materials' },
      { name: 'Units', path: '/raw-materials/units' },
      { name: 'Inventory', path: '/raw-materials/inventory' },
      { name: 'GRN', path: '/raw-materials/grn' },
    ]
  },
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
    name: 'Menu',
    icon: 'menu',
    items: [
      { name: 'Menus', path: '/menu/menus' },
      { name: 'Menu Items', path: '/menu/menu-items' },
      { name: 'Variants', path: '/menu/variants' },
      { name: 'Menu Categories', path: '/menu/menu-categories' },
      //{ name: 'Recipes', path: '/menu/recipes' },
    ]
  },
  { type: 'item', name: 'Users', path: '/users', icon: 'users' },
  {
    type: 'group',
    name: 'Settings',
    icon: 'settings',
    items: [
      { name: 'Roles', path: '/roles' },
      { name: 'Branches', path: '/branches' },
    ]
  }
];

