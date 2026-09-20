import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useLocation } from "react-router-dom";

import "./FloatingWhatsApp.css";

const API_URL = "http://127.0.0.1:8000";

const LATEST_ORDER_STORAGE_KEY =
  "tfortech_latest_order_for_whatsapp";

const FloatingWhatsApp = () => {
  const location = useLocation();

  const [settings, setSettings] = useState(null);

  // ============================================================
  // LOAD WHATSAPP SETTINGS
  // ============================================================

  useEffect(() => {
    let isMounted = true;

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
          return;
        }

        const data = await response.json();

        if (
          isMounted &&
          data?.success &&
          data?.floating
        ) {
          setSettings(data.floating);
        }
      } catch (error) {
        console.error(
          "Floating WhatsApp settings loading error:",
          error
        );
      }
    };

    fetchWhatsAppSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // FORMAT DATE
  // ============================================================

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

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatOrderTime = (dateString) => {
    if (!dateString) {
      return "Time unavailable";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Time unavailable";
    }

    return date.toLocaleTimeString(
      "en-PK",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ============================================================
  // READ LATEST ORDER FROM SESSION STORAGE
  // ============================================================

  const getStoredLatestOrder = () => {
    try {
      const storedOrder =
        sessionStorage.getItem(
          LATEST_ORDER_STORAGE_KEY
        );

      if (!storedOrder) {
        return null;
      }

      const parsedOrder =
        JSON.parse(storedOrder);

      if (
        !parsedOrder ||
        typeof parsedOrder !== "object"
      ) {
        return null;
      }

      return parsedOrder;
    } catch (error) {
      console.error(
        "Unable to read latest order:",
        error
      );

      return null;
    }
  };

  // ============================================================
  // CREATE COMPLETE ORDER MESSAGE
  // ============================================================

  const createOrderMessage = (order) => {
    if (!order) {
      return "";
    }

    // ==========================================================
    // PRODUCTS
    // ==========================================================

    const productLines =
      Array.isArray(order.items)
        ? order.items.map(
            (item, index) => {
              const productName =
                item?.product_name ||
                "Product";

              const quantity =
                Number(
                  item?.quantity || 0
                );

              const price =
                Number(
                  item?.price || 0
                );

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

    // ==========================================================
    // ORDER DATA
    // ==========================================================

    const orderId =
      order.id ||
      "N/A";

    const orderTotal =
      Number(
        order.total_amount || 0
      );

    const shippingAddress =
      order.shipping_address ||
      "Not provided";

    const phone =
      order.phone ||
      "Not provided";

    const paymentMethod =
      order.payment_method ||
      "Not provided";

    const createdAt =
      order.created_at;

    // ==========================================================
    // MESSAGE
    // ==========================================================

    const floatingMessage =
      settings?.message ||
      "Hello GoJuniors, I need some help with my order.";

    return [
      floatingMessage,
      "",
      "Order Details",
      "-------------------------",
      `Order ID: #${orderId}`,
      `Order Date: ${formatOrderDate(
        createdAt
      )}`,
      `Order Time: ${formatOrderTime(
        createdAt
      )}`,
      "",
      "Products:",
      productsText,
      "",
      `Order Total: PKR ${orderTotal.toLocaleString()}`,
      "",
      "Delivery Information:",
      `Address: ${shippingAddress}`,
      `Phone: ${phone}`,
      `Payment: ${paymentMethod}`,
    ].join("\n");
  };

  // ============================================================
  // NORMALIZE PAKISTANI WHATSAPP NUMBER
  // ============================================================

  const normalizeWhatsAppNumber = (phone) => {
    if (!phone) {
      return "";
    }

    let phoneNumber = String(phone).replace(
      /\D/g,
      ""
    );

    if (
      phoneNumber.startsWith("0") &&
      phoneNumber.length === 11
    ) {
      phoneNumber =
        "92" +
        phoneNumber.substring(1);
    }

    return phoneNumber;
  };

  // ============================================================
  // OPEN WHATSAPP
  // ============================================================

  const handleWhatsAppClick = () => {
    if (
      !settings?.enabled ||
      !settings?.phone
    ) {
      return;
    }

    const phoneNumber =
      normalizeWhatsAppNumber(
        settings.phone
      );

    if (!phoneNumber) {
      return;
    }

    let message =
      settings.message ||
      "Hello GoJuniors, I need some help.";

    // ==========================================================
    // ORDERS PAGE
    // ==========================================================

    if (location.pathname === "/orders") {
      const latestOrder =
        getStoredLatestOrder();

      if (latestOrder) {
        message =
          createOrderMessage(
            latestOrder
          );
      } else {
        /*
         * This should only happen if the customer
         * has no stored order.
         */
        message =
          "Hello GoJuniors, I need help with my order.";
      }
    }

    // ==========================================================
    // WHATSAPP URL
    // ==========================================================

    const whatsappUrl =
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;

    // ==========================================================
    // OPEN WHATSAPP
    // ==========================================================

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ============================================================
  // HIDE BUTTON IF DISABLED
  // ============================================================

  if (
    !settings?.enabled ||
    !settings?.phone
  ) {
    return null;
  }

  // ============================================================
  // POSITION
  // ============================================================

  const positionClass =
    settings.position === "bottom-left"
      ? "floating-whatsapp-left"
      : "floating-whatsapp-right";

  // ============================================================
  // BUTTON
  // ============================================================

  return (
    <button
      type="button"
      className={`floating-whatsapp ${positionClass}`}
      onClick={handleWhatsAppClick}
      aria-label={
        settings.label ||
        "Chat on WhatsApp"
      }
      title={
        settings.label ||
        "Chat on WhatsApp"
      }
    >
      <FaWhatsapp className="floating-whatsapp-icon" />

      <span className="floating-whatsapp-label">
        {settings.label ||
          "Chat on WhatsApp"}
      </span>
    </button>
  );
};

export default FloatingWhatsApp;