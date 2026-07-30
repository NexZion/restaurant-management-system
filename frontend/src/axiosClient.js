import axios from "axios";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  isSessionValid,
  saveAuthSession,
} from "./utils/authStorage";

const baseURL = `${import.meta.env.VITE_API_URL}/api`;

export const parseApiError = (error) => ({
  status: error?.response?.status || 0,
  message:
    Object.values(error?.response?.data?.errors || {}).flat().join(" ") ||
    error?.response?.data?.message ||
    error?.message ||
    "Request failed.",
  errors: error?.response?.data?.errors || {},
});

const axiosClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && !isSessionValid()) {
    clearAuthSession();
    window.location.assign("/");
    return Promise.reject(new axios.Cancel("Session expired"));
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshRequest = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    if (status === 401 && !original._retry && getStoredToken() && !original.url?.includes("auth/")) {
      original._retry = true;
      try {
        refreshRequest ||= axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${getStoredToken()}`, Accept: "application/json" } },
        );
        const response = await refreshRequest;
        saveAuthSession({ token: response.data.token, user: getStoredUser() });
        original.headers.Authorization = `Bearer ${response.data.token}`;
        return axiosClient(original);
      } catch {
        clearAuthSession();
        window.location.assign("/");
      } finally {
        refreshRequest = null;
      }
    }

    if (status === 401) {
      clearAuthSession();
      if (!original.url?.includes("auth/login")) window.location.assign("/");
    } else if (status === 403) {
      window.dispatchEvent(new CustomEvent("api:forbidden", { detail: parseApiError(error) }));
    } else if ([404, 409, 422, 500].includes(status)) {
      window.dispatchEvent(new CustomEvent("api:error", { detail: parseApiError(error) }));
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
