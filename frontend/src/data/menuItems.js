// Menu items data
export const menuItems = [
  { type: 'item', name: 'components (Remove Later)', path: '/components', icon: 'components' },
  { type: 'item', name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  // { type: 'item', name: 'AI Gen', path: '/ai', icon: 'ai' },
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
    name: 'Menu',
    icon: 'menu',
    items: [
      { name: 'Menus', path: '/menu/menus' },
      { name: 'Menu Items', path: '/menu/menu-items' },
      { name: 'Menu Categories', path: '/menu/menu-categories' },
    ]
  },
  { type: 'item', name: 'Users', path: '/users', icon: 'users' },
];
