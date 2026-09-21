import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaShoppingCart,
  FaStore,
  FaThLarge,
  FaHome,
  FaSignOutAlt,
  FaWhatsapp,
  FaPalette,
  FaStar,
  FaImage,
  FaUsers,
} from "react-icons/fa";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const userRole =
    String(
      localStorage.getItem("tfortech_user_role") ||
        "customer"
    )
      .toLowerCase()
      .trim();

  const isAdmin =
    userRole === "admin";

  const isCoAdmin =
    userRole === "co_admin";

  const canAccessAdminPanel =
    isAdmin ||
    isCoAdmin;

  const handleLogout = () => {
    localStorage.removeItem("tfortech_logged_in");
    localStorage.removeItem("tfortech_access_token");
    localStorage.removeItem("tfortech_token_type");
    localStorage.removeItem("tfortech_user_id");
    localStorage.removeItem("tfortech_user_name");
    localStorage.removeItem("tfortech_user_email");
    localStorage.removeItem("tfortech_user_phone");
    localStorage.removeItem("tfortech_user_role");
    localStorage.removeItem("tfortech_remember_me");

    navigate("/login");
  };

  const isDashboardActive =
    location.pathname === "/admin" ||
    location.pathname === "/admin/dashboard";

  return (
    <div className="admin-layout-wrapper">

      {/* =====================================================
          COMMON WEBSITE NAVBAR
          ===================================================== */}

      <Navbar />

      {/* =====================================================
          ADMIN AREA
          ===================================================== */}

      {canAccessAdminPanel && (
        <div className="admin-layout">

          {/* ===================================================
              ADMIN SIDEBAR
              =================================================== */}

          <aside className="admin-sidebar">

            <div className="admin-sidebar-brand">

              <div className="admin-brand-logo">
                TF
              </div>

              <div className="admin-brand-text">
                <h2>TFORTECH</h2>
                <span>Admin Panel</span>
              </div>

            </div>

            <nav className="admin-sidebar-nav">

              {/* ================= MAIN ================= */}

              <div className="admin-nav-section">

                <span className="admin-nav-section-title">
                  MAIN
                </span>

                {/* =================================================
                    ADMIN ONLY
                    DASHBOARD
                ================================================= */}

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={() =>
                      `admin-nav-link ${
                        isDashboardActive
                          ? "active"
                          : ""
                      }`
                    }
                  >
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                  </NavLink>
                )}

                {/* =================================================
                    PRODUCTS
                    ADMIN + CO ADMIN
                ================================================= */}

                <NavLink
                  to="/admin/products"
                  className={({ isActive }) =>
                    `admin-nav-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <FaBoxOpen />
                  <span>Products</span>
                </NavLink>

                {/* =================================================
                    HERO
                    ADMIN ONLY
                ================================================= */}

                {isAdmin && (
                  <NavLink
                    to="/admin/hero"
                    className={({ isActive }) =>
                      `admin-nav-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <FaImage />
                    <span>Hero</span>
                  </NavLink>
                )}

                {/* =================================================
                    ORDERS
                    ADMIN + CO ADMIN
                ================================================= */}

                <NavLink
                  to="/admin/orders"
                  className={({ isActive }) =>
                    `admin-nav-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <FaShoppingCart />
                  <span>Orders</span>
                </NavLink>

                {/* =================================================
                    CUSTOMER REVIEWS
                    ADMIN ONLY
                ================================================= */}

                {isAdmin && (
                  <NavLink
                    to="/admin/reviews"
                    className={({ isActive }) =>
                      `admin-nav-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <FaStar />
                    <span>Customer Reviews</span>
                  </NavLink>
                )}

                {/* =================================================
                    WHATSAPP
                    ADMIN ONLY
                ================================================= */}

                {isAdmin && (
                  <NavLink
                    to="/admin/whatsapp"
                    className={({ isActive }) =>
                      `admin-nav-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <FaWhatsapp />
                    <span>WhatsApp Alerts</span>
                  </NavLink>
                )}

                {/* =================================================
                    THEME
                    ADMIN ONLY
                ================================================= */}

                {isAdmin && (
                  <NavLink
                    to="/admin/theme"
                    className={({ isActive }) =>
                      `admin-nav-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <FaPalette />
                    <span>Theme</span>
                  </NavLink>
                )}

                {/* =================================================
                    ADMIN MEMBERS
                    ADMIN ONLY
                ================================================= */}

                {isAdmin && (
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `admin-nav-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <FaUsers />
                    <span>Admin Members</span>
                  </NavLink>
                )}

              </div>

              {/* ===================================================
                  STORE
                  ADMIN ONLY
              =================================================== */}

              {isAdmin && (
                <div className="admin-nav-section">

                  <span className="admin-nav-section-title">
                    STORE
                  </span>

                  <NavLink
                    to="/products"
                    className={({ isActive }) =>
                      `admin-nav-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <FaStore />
                    <span>Store Products</span>
                  </NavLink>

                  <NavLink
                    to="/categories"
                    className={({ isActive }) =>
                      `admin-nav-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <FaThLarge />
                    <span>Categories</span>
                  </NavLink>

                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `admin-nav-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <FaHome />
                    <span>Visit Store</span>
                  </NavLink>

                </div>
              )}

            </nav>

            {/* =================================================
                LOGOUT
                ================================================= */}

            <div className="admin-sidebar-footer">

              <button
                type="button"
                className="admin-logout-button"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>

            </div>

          </aside>

          {/* ===================================================
              CURRENT ADMIN PAGE
              =================================================== */}

          <main className="admin-main-content">
            {children}
          </main>

        </div>
      )}

      {/* =====================================================
          COMMON WEBSITE FOOTER
          ===================================================== */}

      <Footer />

    </div>
  );
};

export default AdminLayout;