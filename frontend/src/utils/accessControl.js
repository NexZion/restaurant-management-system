import { getStoredUser } from "./authStorage";

export const ACCESS_LEVELS = {
  VIEWER: 10,
  RECEPTION: 20,
  WAITER: 30,
  CASHIER: 40,
  KITCHEN: 50,
  INVENTORY: 60,
  ACCOUNTANT: 70,
  MANAGER: 80,
  ADMIN: 90,
  SUPER_ADMIN: 100,
};

export const getAccessLevel = (user = getStoredUser()) =>
  Number(user?.role?.access_level ?? user?.access_level ?? 0);

export const canAccess = (allowedLevels = [], user = getStoredUser()) => {
  const level = getAccessLevel(user);

  if (!allowedLevels?.length) return level > 0;
  if (allowedLevels.includes(ACCESS_LEVELS.SUPER_ADMIN) && allowedLevels.length === 1) {
    return level === ACCESS_LEVELS.SUPER_ADMIN;
  }
  if (allowedLevels.includes(ACCESS_LEVELS.ADMIN) && !allowedLevels.includes(ACCESS_LEVELS.MANAGER)) {
    return level >= ACCESS_LEVELS.ADMIN;
  }
  if (level >= ACCESS_LEVELS.MANAGER) return true;

  return allowedLevels.includes(level);
};

export const defaultRouteForLevel = (level) => {
  if (level === ACCESS_LEVELS.WAITER) return "/pos/new-order";
  if (level === ACCESS_LEVELS.CASHIER) return "/pos/billing";
  if (level === ACCESS_LEVELS.KITCHEN) return "/kitchen/display";
  if (level === ACCESS_LEVELS.INVENTORY) return "/inventory/stock-levels";
  if (level === ACCESS_LEVELS.ACCOUNTANT) return "/billing/payments";
  if (level === ACCESS_LEVELS.RECEPTION) return "/restaurant/reservations";

  return "/dashboard";
};

export const accessLevelLabel = (level) =>
  ({
    10: "Read-only",
    20: "Reception",
    30: "Waiter",
    40: "Cashier",
    50: "Kitchen",
    60: "Inventory",
    70: "Accountant",
    80: "Manager",
    90: "Administrator",
    100: "Super Administrator",
  })[Number(level)] || "Unknown";
