import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();

  const isLoggedIn =
    localStorage.getItem("tfortech_logged_in") === "true";

  const accessToken = localStorage.getItem(
    "tfortech_access_token"
  );

  const userRole = localStorage.getItem(
    "tfortech_user_role"
  );

  // ---------------------------------------------------------
  // NOT LOGGED IN
  // ---------------------------------------------------------

  if (!isLoggedIn || !accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ---------------------------------------------------------
  // ADMIN-ONLY ROUTE
  // ---------------------------------------------------------

  if (adminOnly && userRole !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // ---------------------------------------------------------
  // ACCESS GRANTED
  // ---------------------------------------------------------

  return children;
};

export default ProtectedRoute;
