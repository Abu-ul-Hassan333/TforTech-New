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
} from "react-icons/fa";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("tfortech_logged_in");
    localStorage.removeItem("tfortech_access_token");
    localStorage.removeItem("tfortech_user_role");

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

              <NavLink
                to="/admin"
                className={() =>
                  `admin-nav-link ${
                    isDashboardActive ? "active" : ""
                  }`
                }
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>

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

              {/* ================= CUSTOMER REVIEWS ================= */}

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

              {/* ================= WHATSAPP ================= */}

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

              {/* ================= THEME ================= */}

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
            </div>

            {/* ================= STORE ================= */}

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

      {/* =====================================================
          COMMON WEBSITE FOOTER
          ===================================================== */}

      <Footer />
    </div>
  );
};

export default AdminLayout;