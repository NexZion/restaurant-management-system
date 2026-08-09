import { canAccess } from "../utils/accessControl";

export const PermissionGuard = ({ allowedLevels = [], fallback = null, children }) =>
  canAccess(allowedLevels) ? children : fallback;
