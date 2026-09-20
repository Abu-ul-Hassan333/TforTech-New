import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaMoneyBillWave,
  FaClock,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaStore,
  FaPlus,
  FaSyncAlt,
} from "react-icons/fa";

import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminDashboard.css";

const API_URL = "http://127.0.0.1:8000";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LIVE DATE & TIME
  // =========================================================

  const [currentDateTime, setCurrentDateTime] =
    useState(new Date());

  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDateTime(new Date());
    };

    updateDateTime();

    const interval = setInterval(
      updateDateTime,
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatLiveDate = (date) => {
    return date.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatLiveTime = (date) => {
    return date.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const fetchOrders = useCallback(async () => {
    const loggedIn = localStorage.getItem(
      "tfortech_logged_in"
    );

    const role = localStorage.getItem(
      "tfortech_user_role"
    );

    if (!loggedIn || loggedIn !== "true") {
      navigate("/login");
      return;
    }

    if (role && role.toLowerCase() !== "admin") {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem(
        "tfortech_access_token"
      );

      const response = await fetch(
        `${API_URL}/api/auth/admin/orders`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "tfortech_logged_in"
        );

        localStorage.removeItem(
          "tfortech_access_token"
        );

        localStorage.removeItem(
          "tfortech_user_role"
        );

        navigate("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          "You do not have permission to access the admin dashboard."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load admin orders."
        );
      }

      const data = await response.json();

      const receivedOrders = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
        ? data.orders
        : [];

      setOrders(receivedOrders);
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrderStatus = (order) => {
    return (
      order?.status ||
      order?.orderStatus ||
      order?.order_status ||
      "Pending"
    );
  };

  const normalizeStatus = (status) => {
    return String(status || "Pending")
      .toLowerCase()
      .trim();
  };

  const getOrderTotal = (order) => {
    const total =
      order?.total ??
      order?.totalAmount ??
      order?.grandTotal ??
      order?.amount ??
      0;

    const numericTotal = Number(total);

    return Number.isFinite(numericTotal)
      ? numericTotal
      : 0;
  };

  const getCustomerId = (order) => {
    return (
      order?.userId ||
      order?.user_id ||
      order?.customerId ||
      order?.customer_id ||
      order?.user?._id ||
      order?.user?.id ||
      order?.customer?._id ||
      order?.customer?.id ||
      order?.customer?.email ||
      order?.user?.email ||
      order?.email ||
      null
    );
  };

  const getCustomerName = (order) => {
    const customer =
      order?.customer || order?.user;

    if (typeof customer === "string") {
      return customer;
    }

    if (customer) {
      const fullName = [
        customer.firstName,
        customer.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      if (fullName) {
        return fullName;
      }

      return (
        customer.name ||
        customer.fullName ||
        customer.email ||
        "Customer"
      );
    }

    const fullName = [
      order?.firstName,
      order?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      fullName ||
      order?.customerName ||
      order?.name ||
      order?.email ||
      "Customer"
    );
  };

  const getOrderDate = (order) => {
    return (
      order?.createdAt ||
      order?.created_at ||
      order?.date ||
      order?.orderDate ||
      order?.updatedAt ||
      null
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString(
      "en-PK"
    )}`;
  };

  const getOrderId = (order) => {
    return (
      order?.id ||
      order?._id ||
      order?.orderId ||
      order?.order_id ||
      "—"
    );
  };

  const getShortOrderId = (order) => {
    const id = String(getOrderId(order));

    if (id === "—") {
      return id;
    }

    if (id.length <= 10) {
      return id;
    }

    return `#${id.slice(-8)}`;
  };

  const statistics = useMemo(() => {
    const totalOrders = orders.length;

    let pending = 0;
    let processing = 0;
    let shipped = 0;
    let delivered = 0;
    let cancelled = 0;

    let revenue = 0;

    const customers = new Set();

    orders.forEach((order) => {
      const status = normalizeStatus(
        getOrderStatus(order)
      );

      if (status === "pending") {
        pending += 1;
      } else if (status === "processing") {
        processing += 1;
      } else if (status === "shipped") {
        shipped += 1;
      } else if (status === "delivered") {
        delivered += 1;
      } else if (
        status === "cancelled" ||
        status === "canceled"
      ) {
        cancelled += 1;
      }

      const customerId = getCustomerId(order);

      if (customerId) {
        customers.add(String(customerId));
      }

      if (
        status !== "cancelled" &&
        status !== "canceled"
      ) {
        revenue += getOrderTotal(order);
      }
    });

    return {
      totalOrders,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      revenue,
      customers: customers.size,
    };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(
          getOrderDate(a) || 0
        ).getTime();

        const dateB = new Date(
          getOrderDate(b) || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [orders]);

  const getStatusClass = (status) => {
    const normalized =
      normalizeStatus(status);

    if (normalized === "processing") {
      return "processing";
    }

    if (normalized === "shipped") {
      return "shipped";
    }

    if (normalized === "delivered") {
      return "delivered";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return "cancelled";
    }

    return "pending";
  };

  const getStatusIcon = (status) => {
    const normalized =
      normalizeStatus(status);

    if (normalized === "processing") {
      return <FaClock />;
    }

    if (normalized === "shipped") {
      return <FaTruck />;
    }

    if (normalized === "delivered") {
      return <FaCheckCircle />;
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return <FaTimesCircle />;
    }

    return <FaClock />;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-page">
          <div className="admin-loading-state">
            <div className="admin-loading-spinner">
              <FaSyncAlt />
            </div>

            <h2>Loading Dashboard</h2>

            <p>
              Please wait while we load your admin data.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-page">
        {/* =====================================================
            TOP BAR
            ===================================================== */}

        <div className="admin-dashboard-topbar">
          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back! Here&apos;s what&apos;s
              happening with your store.
            </p>
          </div>

          <div
            className="admin-dashboard-topbar-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* =================================================
                LIVE DATE & TIME
                ================================================= */}

            <div
              className="admin-live-datetime"
              title="Live date and time"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 14px",
                borderRadius: "10px",
                background: "#ffffff",
                border: "1px solid #e3e8f0",
                boxShadow:
                  "0 4px 12px rgba(15, 23, 42, 0.04)",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.2,
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#7a8495",
                    marginBottom: "3px",
                  }}
                >
                  Live Date &amp; Time
                </span>

                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  {formatLiveDate(
                    currentDateTime
                  )}
                  {" • "}
                  {formatLiveTime(
                    currentDateTime
                  )}
                </span>
              </div>
            </div>

            {/* =================================================
                REFRESH
                ================================================= */}

            <button
              type="button"
              className="admin-refresh-button"
              onClick={fetchOrders}
              title="Refresh dashboard"
            >
              <FaSyncAlt />
            </button>

            {/* =================================================
                VIEW STORE
                ================================================= */}

            <Link
              to="/"
              className="admin-view-store-button"
            >
              <FaStore />
              <span>View Store</span>
            </Link>

            {/* =================================================
                ADD PRODUCT
                ================================================= */}

            <Link
              to="/admin/products"
              className="admin-add-product-button"
            >
              <FaPlus />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <div className="admin-error-state">
            <FaTimesCircle />

            <div>
              <strong>
                Unable to load dashboard
              </strong>

              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={fetchOrders}
            >
              Try Again
            </button>
          </div>
        )}

        {/* =====================================================
            STATISTICS
            ===================================================== */}

        <section className="admin-statistics-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-card-content">
              <span className="admin-stat-label">
                Total Orders
              </span>

              <strong className="admin-stat-value">
                {statistics.totalOrders}
              </strong>

              <span className="admin-stat-description">
                All orders received
              </span>
            </div>

            <div className="admin-stat-icon orders">
              <FaShoppingCart />
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-card-content">
              <span className="admin-stat-label">
                Customers
              </span>

              <strong className="admin-stat-value">
                {statistics.customers}
              </strong>

              <span className="admin-stat-description">
                Unique customers
              </span>
            </div>

            <div className="admin-stat-icon customers">
              <FaUsers />
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-card-content">
              <span className="admin-stat-label">
                Revenue
              </span>

              <strong className="admin-stat-value revenue">
                {formatCurrency(
                  statistics.revenue
                )}
              </strong>

              <span className="admin-stat-description">
                Excluding cancelled orders
              </span>
            </div>

            <div className="admin-stat-icon revenue">
              <FaMoneyBillWave />
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-card-content">
              <span className="admin-stat-label">
                Pending Orders
              </span>

              <strong className="admin-stat-value">
                {statistics.pending}
              </strong>

              <span className="admin-stat-description">
                Need your attention
              </span>
            </div>

            <div className="admin-stat-icon pending">
              <FaClock />
            </div>
          </div>
        </section>

        {/* =====================================================
            ORDER STATUS
            ===================================================== */}

        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2>Order Overview</h2>

              <p>
                Current order status breakdown.
              </p>
            </div>

            <Link
              to="/admin/orders"
              className="admin-section-link"
            >
              Manage Orders
              <FaArrowRight />
            </Link>
          </div>

          <div className="admin-order-status-grid">
            <div className="admin-order-status-card pending">
              <div className="admin-order-status-icon">
                <FaClock />
              </div>

              <div>
                <span>Pending</span>

                <strong>
                  {statistics.pending}
                </strong>
              </div>
            </div>

            <div className="admin-order-status-card processing">
              <div className="admin-order-status-icon">
                <FaBoxOpen />
              </div>

              <div>
                <span>Processing</span>

                <strong>
                  {statistics.processing}
                </strong>
              </div>
            </div>

            <div className="admin-order-status-card shipped">
              <div className="admin-order-status-icon">
                <FaTruck />
              </div>

              <div>
                <span>Shipped</span>

                <strong>
                  {statistics.shipped}
                </strong>
              </div>
            </div>

            <div className="admin-order-status-card delivered">
              <div className="admin-order-status-icon">
                <FaCheckCircle />
              </div>

              <div>
                <span>Delivered</span>

                <strong>
                  {statistics.delivered}
                </strong>
              </div>
            </div>

            <div className="admin-order-status-card cancelled">
              <div className="admin-order-status-icon">
                <FaTimesCircle />
              </div>

              <div>
                <span>Cancelled</span>

                <strong>
                  {statistics.cancelled}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MANAGEMENT CARDS
            ===================================================== */}

        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2>Quick Management</h2>

              <p>
                Manage your store from one place.
              </p>
            </div>
          </div>

          <div className="admin-management-grid">
            <Link
              to="/admin/products"
              className="admin-management-card"
            >
              <div className="admin-management-icon products">
                <FaBoxOpen />
              </div>

              <div className="admin-management-content">
                <h3>Manage Products</h3>

                <p>
                  Add, edit, delete and update
                  product stock.
                </p>
              </div>

              <FaArrowRight className="admin-management-arrow" />
            </Link>

            <Link
              to="/admin/orders"
              className="admin-management-card"
            >
              <div className="admin-management-icon orders">
                <FaShoppingCart />
              </div>

              <div className="admin-management-content">
                <h3>Manage Orders</h3>

                <p>
                  View customer orders and update
                  order statuses.
                </p>
              </div>

              <FaArrowRight className="admin-management-arrow" />
            </Link>

            <Link
              to="/products"
              className="admin-management-card"
            >
              <div className="admin-management-icon store">
                <FaStore />
              </div>

              <div className="admin-management-content">
                <h3>View Store</h3>

                <p>
                  Open the customer-facing product
                  store.
                </p>
              </div>

              <FaArrowRight className="admin-management-arrow" />
            </Link>
          </div>
        </section>

        {/* =====================================================
            RECENT ORDERS
            ===================================================== */}

        <section className="admin-section admin-recent-orders-section">
          <div className="admin-section-heading">
            <div>
              <h2>Recent Orders</h2>

              <p>
                Latest orders received by your store.
              </p>
            </div>

            <Link
              to="/admin/orders"
              className="admin-section-link"
            >
              View All
              <FaArrowRight />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="admin-empty-state">
              <FaShoppingCart />

              <h3>No Orders Yet</h3>

              <p>
                Orders will appear here when
                customers place them.
              </p>
            </div>
          ) : (
            <div className="admin-orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map(
                    (order, index) => {
                      const status =
                        getOrderStatus(order);

                      const orderKey =
                        getOrderId(order) !== "—"
                          ? getOrderId(order)
                          : index;

                      return (
                        <tr key={orderKey}>
                          <td>
                            <strong className="admin-order-id">
                              {getShortOrderId(
                                order
                              )}
                            </strong>
                          </td>

                          <td>
                            <div className="admin-customer-cell">
                              <div className="admin-customer-avatar">
                                {getCustomerName(
                                  order
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span>
                                {getCustomerName(
                                  order
                                )}
                              </span>
                            </div>
                          </td>

                          <td>
                            {formatDate(
                              getOrderDate(order)
                            )}
                          </td>

                          <td>
                            <strong>
                              {formatCurrency(
                                getOrderTotal(
                                  order
                                )
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`admin-status-badge ${getStatusClass(
                                status
                              )}`}
                            >
                              {getStatusIcon(
                                status
                              )}
                              {status}
                            </span>
                          </td>

                          <td>
                            <Link
                              to="/admin/orders"
                              className="admin-order-view-link"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;