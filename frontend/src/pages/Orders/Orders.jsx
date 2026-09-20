import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./Orders.css";

const API_URL = "http://localhost:8000";

const LATEST_ORDER_STORAGE_KEY =
  "tfortech_latest_order_for_whatsapp";

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [whatsappSettings, setWhatsappSettings] =
    useState(null);

  // ==========================================
  // SCROLL TO TOP
  // ==========================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  // ==========================================
  // AUTHENTICATION FAILURE
  // ==========================================

  const handleAuthenticationFailure = () => {
    localStorage.removeItem("tfortech_logged_in");
    localStorage.removeItem("tfortech_access_token");
    localStorage.removeItem("tfortech_token_type");
    localStorage.removeItem("tfortech_user_id");
    localStorage.removeItem("tfortech_user_name");
    localStorage.removeItem("tfortech_user_email");
    localStorage.removeItem("tfortech_user_phone");
    localStorage.removeItem("tfortech_user_role");
    localStorage.removeItem("tfortech_remember_me");

    sessionStorage.removeItem(
      LATEST_ORDER_STORAGE_KEY
    );

    navigate("/login");
  };

  // ==========================================
  // GET LATEST ORDER
  // ==========================================

  const getLatestOrder = (orderList) => {
    if (
      !Array.isArray(orderList) ||
      orderList.length === 0
    ) {
      return null;
    }

    const sortedOrders = [...orderList].sort(
      (firstOrder, secondOrder) => {
        const firstDate = new Date(
          firstOrder?.created_at || 0
        ).getTime();

        const secondDate = new Date(
          secondOrder?.created_at || 0
        ).getTime();

        return secondDate - firstDate;
      }
    );

    return sortedOrders[0];
  };

  // ==========================================
  // FETCH MY ORDERS
  // ==========================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem(
          "tfortech_access_token"
        );

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/auth/orders`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          handleAuthenticationFailure();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to load your orders."
          );
        }

        const customerOrders =
          Array.isArray(data)
            ? data
            : [];

        setOrders(customerOrders);

        // ======================================
        // SAVE LATEST ORDER FOR FLOATING WHATSAPP
        // ======================================

        const latestOrder =
          getLatestOrder(customerOrders);

        if (latestOrder) {
          sessionStorage.setItem(
            LATEST_ORDER_STORAGE_KEY,
            JSON.stringify(latestOrder)
          );
        } else {
          sessionStorage.removeItem(
            LATEST_ORDER_STORAGE_KEY
          );
        }
      } catch (fetchError) {
        console.error(
          "Orders loading error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Authentication handler is intentionally
    // kept outside the dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ==========================================
  // FETCH WHATSAPP SETTINGS
  // ==========================================

  useEffect(() => {
    const fetchWhatsAppSettings = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/whatsapp/public`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Unable to load WhatsApp settings."
          );

          return;
        }

        const data = await response.json();

        if (
          data &&
          data.success &&
          data.order
        ) {
          setWhatsappSettings(data);
        }
      } catch (fetchError) {
        console.error(
          "WhatsApp settings loading error:",
          fetchError
        );
      }
    };

    fetchWhatsAppSettings();
  }, []);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatOrderDate = (dateString) => {
    if (!dateString) {
      return "Date unavailable";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-PK",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatOrderTime = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString(
      "en-PK",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==========================================
  // ORDER STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    const normalizedStatus =
      String(status || "")
        .toLowerCase()
        .replace(/\s+/g, "-");

    return `orders-status orders-status-${normalizedStatus}`;
  };

  // ==========================================
  // ORDER WHATSAPP HANDLER
  // ==========================================

  const handleOrderOnWhatsApp = (order) => {
    const orderSettings =
      whatsappSettings?.order;

    if (
      !orderSettings?.enabled ||
      !orderSettings?.phone
    ) {
      return;
    }

    const productLines =
      Array.isArray(order.items)
        ? order.items.map(
            (item, index) => {
              const productName =
                item.product_name ||
                "Product";

              const quantity =
                Number(item.quantity || 0);

              const price =
                Number(item.price || 0);

              const itemTotal =
                price * quantity;

              return `${index + 1}. ${productName} | Qty: ${quantity} | PKR ${itemTotal.toLocaleString()}`;
            }
          )
        : [];

    const productsText =
      productLines.length > 0
        ? productLines.join("\n")
        : "No product details available.";

    const orderMessage =
      orderSettings.message ||
      "Hello GoJuniors, I want to discuss my order.";

    const message = [
      orderMessage,
      "",
      "Order Details",
      "-------------------------",
      `Order ID: #${order.id || "N/A"}`,
      `Order Date: ${formatOrderDate(
        order.created_at
      )}`,
      `Order Time: ${formatOrderTime(
        order.created_at
      )}`,
      "",
      "Products:",
      productsText,
      "",
      `Order Total: PKR ${Number(
        order.total_amount || 0
      ).toLocaleString()}`,
      "",
      "Delivery Information:",
      `Address: ${
        order.shipping_address ||
        "Not provided"
      }`,
      `Phone: ${
        order.phone ||
        "Not provided"
      }`,
      `Payment: ${
        order.payment_method ||
        "Not provided"
      }`,
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${orderSettings.phone}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // WHATSAPP BUTTON VISIBILITY
  // ==========================================

  const showOrderWhatsApp =
    Boolean(
      whatsappSettings?.order?.enabled &&
      whatsappSettings?.order?.phone
    );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="orders-page">
          <div className="orders-container">
            <div className="orders-header">
              <h1>My Orders</h1>

              <p>
                Loading your orders...
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <>
        <Navbar />

        <main className="orders-page">
          <div className="orders-container">
            <div className="orders-header">
              <h1>My Orders</h1>

              <p>{error}</p>
            </div>

            <div className="orders-empty-card">
              <div className="orders-empty-icon">
                ⚠️
              </div>

              <h2>
                Unable to Load Orders
              </h2>

              <p>
                Please try again later.
              </p>

              <button
                type="button"
                className="orders-primary-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================
  // EMPTY ORDERS
  // ==========================================

  if (orders.length === 0) {
    return (
      <>
        <Navbar />

        <main className="orders-page">
          <div className="orders-container">
            <div className="orders-header">
              <h1>My Orders</h1>

              <p>
                View and track your orders here.
              </p>
            </div>

            <div className="orders-empty-card">
              <div className="orders-empty-icon">
                📦
              </div>

              <h2>
                No Orders Yet
              </h2>

              <p>
                You haven't placed any orders yet.
                Start shopping to see your orders here.
              </p>

              <Link
                to="/products"
                className="orders-primary-button"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================
  // ORDERS PAGE
  // ==========================================

  return (
    <>
      <Navbar />

      <main className="orders-page">
        <div className="orders-container">

          {/* ==================================
              HEADER
          ================================== */}

          <div className="orders-header">
            <h1>
              My Orders
            </h1>

            <p>
              View and track all your orders.
            </p>
          </div>

          {/* ==================================
              ORDER COUNT
          ================================== */}

          <div className="orders-count-card">
            <div>
              <span className="orders-count-label">
                TOTAL ORDERS
              </span>

              <strong className="orders-count-number">
                {orders.length}
              </strong>
            </div>
          </div>

          {/* ==================================
              ORDER LIST
          ================================== */}

          <div className="orders-list">
            {orders.map((order) => (
              <article
                className="orders-card"
                key={order.id}
              >

                {/* ==============================
                    ORDER HEADER
                ============================== */}

                <div className="orders-card-header">
                  <div>
                    <span className="orders-order-label">
                      ORDER ID
                    </span>

                    <strong className="orders-order-id">
                      #{order.id}
                    </strong>
                  </div>

                  <span
                    className={getStatusClass(
                      order.status
                    )}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>

                {/* ==============================
                    ORDER DATE
                ============================== */}

                <div className="orders-date">
                  <span>
                    Placed on
                  </span>

                  <strong>
                    {formatOrderDate(
                      order.created_at
                    )}
                  </strong>

                  <span>
                    {formatOrderTime(
                      order.created_at
                    )}
                  </span>
                </div>

                {/* ==============================
                    PRODUCTS
                ============================== */}

                <div className="orders-products">
                  {order.items?.map(
                    (item, index) => (
                      <div
                        className="orders-product"
                        key={`${order.id}-${item.product_id}-${index}`}
                      >

                        <div className="orders-product-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={
                                item.product_name
                              }
                            />
                          ) : (
                            <div className="orders-product-placeholder">
                              Laptop
                            </div>
                          )}
                        </div>

                        <div className="orders-product-info">
                          <h3>
                            {item.product_name}
                          </h3>

                          <p>
                            Quantity:{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <div className="orders-product-price">
                          PKR{" "}
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                          ).toLocaleString()}
                        </div>

                      </div>
                    )
                  )}
                </div>

                {/* ==============================
                    SHIPPING INFORMATION
                ============================== */}

                <div className="orders-shipping">

                  <div>
                    <span>
                      Delivery Address
                    </span>

                    <strong>
                      {order.shipping_address}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Phone
                    </span>

                    <strong>
                      {order.phone}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payment
                    </span>

                    <strong>
                      {order.payment_method}
                    </strong>
                  </div>

                </div>

                {/* ==============================
                    ORDER TOTAL
                ============================== */}

                <div className="orders-card-footer">
                  <span>
                    Order Total
                  </span>

                  <strong>
                    PKR{" "}
                    {Number(
                      order.total_amount || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                {/* ==============================
                    WHATSAPP ORDER BUTTON
                ============================== */}

                {showOrderWhatsApp && (
                  <div className="orders-whatsapp-action">
                    <button
                      type="button"
                      className="orders-whatsapp-button"
                      onClick={() =>
                        handleOrderOnWhatsApp(
                          order
                        )
                      }
                    >
                      <FaWhatsapp />

                      <span>
                        Order on WhatsApp
                      </span>
                    </button>
                  </div>
                )}

              </article>
            ))}
          </div>

          {/* ==================================
              CONTINUE SHOPPING
          ================================== */}

          <div className="orders-bottom-action">
            <Link
              to="/products"
              className="orders-primary-button"
            >
              Continue Shopping
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default Orders;