import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  clearAuthSession,
  getAuthExpiry,
  isSessionValid,
} from "../utils/authStorage";
import { canAccess } from "../utils/accessControl";

export const ProtectedRoute = ({ children, allowedLevels = [] }) => {
  const navigate = useNavigate();
  const [sessionValid, setSessionValid] = useState(() => isSessionValid());

  useEffect(() => {
    if (!sessionValid) {
      return;
    }

    const authExpiry = getAuthExpiry();

    if (!authExpiry) {
      return;
    }

    const logoutTimer = window.setTimeout(
      () => {
        clearAuthSession();
        setSessionValid(false);
        navigate("/", { replace: true });
      },
      Math.max(authExpiry - Date.now(), 0),
    );

    return () => {
      window.clearTimeout(logoutTimer);
    };
  }, [navigate, sessionValid]);

  if (!sessionValid) {
    return <Navigate to="/" replace />;
  }

  if (!canAccess(allowedLevels)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};
