import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  children,
  adminOnly = false,
  allowedRoles = null,
}) => {
  const isLoggedIn =
    localStorage.getItem("tfortech_logged_in") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const userRole =
    String(
      localStorage.getItem("tfortech_user_role") || "customer"
    )
      .toLowerCase()
      .trim();

  if (adminOnly) {
    const hasAdminAccess =
      userRole === "admin" ||
      userRole === "co_admin";

    if (!hasAdminAccess) {
      return <Navigate to="/" replace />;
    }
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;