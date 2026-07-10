import api from "../axiosClient";
import { clearAuthSession } from "./authStorage";

export const logoutUser = async ({ navigate, onAfterLogout } = {}) => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearAuthSession();

    if (typeof onAfterLogout === "function") {
      onAfterLogout();
    }

    if (typeof navigate === "function") {
      navigate("/", { replace: true });
      return;
    }

    window.location.replace("/");
  }
};