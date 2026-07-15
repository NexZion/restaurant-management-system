const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const USER_KEY = "USER";
const TOKEN_EXPIRY_KEY = "TOKEN_EXPIRY";
const ROLE_ID_KEY = "ROLE_ID";
const BRANCH_ID_KEY = "BRANCH_ID";

const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Unable to decode auth token:", error);
    return null;
  }
};

export const getTokenExpiry = (token) => {
  const payload = decodeJwtPayload(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

export const saveAuthSession = ({ token, user, rememberMe }) => {
  const tokenExpiry = getTokenExpiry(token);
  const sessionUser = user || getStoredUser();
  const roleId = sessionUser?.role_id || sessionUser?.role?.id;
  const branchId = sessionUser?.branch_id || sessionUser?.branch?.id;

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(sessionUser || {}));

  if (tokenExpiry) {
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(tokenExpiry));
  } else {
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  if (roleId) {
    localStorage.setItem(ROLE_ID_KEY, String(roleId));
  } else {
    localStorage.removeItem(ROLE_ID_KEY);
  }

  if (branchId) {
    localStorage.setItem(BRANCH_ID_KEY, String(branchId));
  } else {
    localStorage.removeItem(BRANCH_ID_KEY);
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(ROLE_ID_KEY);
  localStorage.removeItem(BRANCH_ID_KEY);
  localStorage.removeItem("user");
};

export const getStoredToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || {};
  } catch (error) {
    console.error("Unable to read stored user:", error);
    return {};
  }
};

export const getStoredTokenExpiry = () => {
  const storedExpiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));

  if (storedExpiry) {
    return storedExpiry;
  }

  const token = getStoredToken();
  return token ? getTokenExpiry(token) : null;
};

export const getAuthExpiry = () => {
  return getStoredTokenExpiry();
};

export const isSessionValid = () => {
  const token = getStoredToken();

  if (!token) {
    return false;
  }

  const authExpiry = getAuthExpiry();

  if (!authExpiry) {
    clearAuthSession();
    return false;
  }

  if (Date.now() >= authExpiry) {
    clearAuthSession();
    return false;
  }

  return true;
};
