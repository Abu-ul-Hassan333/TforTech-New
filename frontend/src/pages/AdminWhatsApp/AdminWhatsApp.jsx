import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaWhatsapp,
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminWhatsApp.css";

// ============================================================
// API
// ============================================================

const API_URL = "http://127.0.0.1:8000";

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const DEFAULT_SETTINGS = {
  order_enabled: true,
  order_phone: "",
  floating_enabled: true,
  floating_phone: "",
  order_message:
    "Hello GoJuniors, I want to place an order.",
  product_message:
    "Hello GoJuniors, I am interested in this product.",
  floating_message:
    "Hello GoJuniors, I need some help.",
  floating_position: "bottom-right",
  floating_label: "Chat on WhatsApp",
};

// ============================================================
// USER ROLE
// ============================================================

const getStoredUserRole = () => {
  return String(
    localStorage.getItem(
      "tfortech_user_role"
    ) || "customer"
  )
    .toLowerCase()
    .trim();
};

// ============================================================
// COMPONENT
// ============================================================

const AdminWhatsApp = () => {
  const [settings, setSettings] = useState(
    DEFAULT_SETTINGS
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    return localStorage.getItem(
      "tfortech_access_token"
    );
  };

  // ==========================================================
  // AUTH FAILURE
  // ==========================================================

  const handleAuthenticationFailure = () => {
    localStorage.removeItem(
      "tfortech_logged_in"
    );

    localStorage.removeItem(
      "tfortech_access_token"
    );

    localStorage.removeItem(
      "tfortech_token_type"
    );

    localStorage.removeItem(
      "tfortech_user_id"
    );

    localStorage.removeItem(
      "tfortech_user_name"
    );

    localStorage.removeItem(
      "tfortech_user_email"
    );

    localStorage.removeItem(
      "tfortech_user_phone"
    );

    localStorage.removeItem(
      "tfortech_user_role"
    );

    localStorage.removeItem(
      "tfortech_remember_me"
    );

    window.location.href = "/login";
  };

  // ==========================================================
  // LOAD SETTINGS
  // ==========================================================

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const currentRole =
        getStoredUserRole();

      if (currentRole !== "admin") {
        window.location.href = "/";
        return;
      }

      const token = getToken();

      if (!token) {
        handleAuthenticationFailure();
        return;
      }

      const response = await fetch(
        `${API_URL}/api/whatsapp/settings`,
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

      if (response.status === 403) {
        setError(
          "Access denied. Only administrators can manage WhatsApp settings."
        );
        return;
      }

      if (!response.ok) {
        let message =
          "Unable to load WhatsApp settings.";

        try {
          const errorData =
            await response.json();

          message =
            errorData.detail || message;
        } catch (parseError) {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const data = await response.json();

      if (
        data &&
        data.success &&
        data.settings
      ) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data.settings,
        });
      }
    } catch (fetchError) {
      console.error(
        "WhatsApp settings load error:",
        fetchError
      );

      setError(
        fetchError.message ||
          "Unable to load WhatsApp settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ==========================================================
  // INPUT HANDLER
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccessMessage("");
  };

  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (
      getStoredUserRole() !== "admin"
    ) {
      window.location.href = "/";
      return;
    }

    if (
      settings.order_enabled &&
      !settings.order_phone.trim()
    ) {
      setError(
        "Please enter the Order WhatsApp number."
      );
      return;
    }

    if (
      settings.floating_enabled &&
      !settings.floating_phone.trim()
    ) {
      setError(
        "Please enter the Floating WhatsApp number."
      );
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        handleAuthenticationFailure();
        return;
      }

      const response = await fetch(
        `${API_URL}/api/whatsapp/settings`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }

      if (response.status === 403) {
        setError(
          "Access denied. Only administrators can save WhatsApp settings."
        );
        return;
      }

      if (!response.ok) {
        let message =
          "Unable to save WhatsApp settings.";

        try {
          const errorData =
            await response.json();

          message =
            errorData.detail || message;
        } catch (parseError) {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const data = await response.json();

      if (
        data &&
        data.success &&
        data.settings
      ) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data.settings,
        });
      }

      setSuccessMessage(
        data.message ||
          "WhatsApp settings saved successfully."
      );
    } catch (saveError) {
      console.error(
        "WhatsApp settings save error:",
        saveError
      );

      setError(
        saveError.message ||
          "Unable to save WhatsApp settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // RESET SETTINGS
  // ==========================================================

  const handleReset = async () => {
    if (
      getStoredUserRole() !== "admin"
    ) {
      window.location.href = "/";
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reset all WhatsApp settings to their default values?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      setResetting(true);

      const token = getToken();

      if (!token) {
        handleAuthenticationFailure();
        return;
      }

      const response = await fetch(
        `${API_URL}/api/whatsapp/settings/reset`,
        {
          method: "POST",
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

      if (response.status === 403) {
        setError(
          "Access denied. Only administrators can reset WhatsApp settings."
        );
        return;
      }

      if (!response.ok) {
        let message =
          "Unable to reset WhatsApp settings.";

        try {
          const errorData =
            await response.json();

          message =
            errorData.detail || message;
        } catch (parseError) {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const data = await response.json();

      if (
        data &&
        data.success &&
        data.settings
      ) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data.settings,
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }

      setSuccessMessage(
        data.message ||
          "WhatsApp settings reset successfully."
      );
    } catch (resetError) {
      console.error(
        "WhatsApp settings reset error:",
        resetError
      );

      setError(
        resetError.message ||
          "Unable to reset WhatsApp settings."
      );
    } finally {
      setResetting(false);
    }
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-whatsapp-loading">
          <div className="admin-whatsapp-spinner" />

          <p>
            Loading WhatsApp settings...
          </p>
        </div>
      </AdminLayout>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <AdminLayout>
      <div className="admin-whatsapp-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="admin-whatsapp-header">

          <div className="admin-whatsapp-header-content">

            <div className="admin-whatsapp-title-row">

              <div className="admin-whatsapp-title-icon">
                <FaWhatsapp />
              </div>

              <div>
                <h1>
                  WhatsApp Alerts
                </h1>

                <p>
                  Manage customer WhatsApp
                  communication and alerts.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            MESSAGES
        ================================================== */}

        {error && (
          <div className="admin-whatsapp-alert admin-whatsapp-alert-error">
            <FaExclamationCircle />

            <span>
              {error}
            </span>
          </div>
        )}

        {successMessage && (
          <div className="admin-whatsapp-alert admin-whatsapp-alert-success">
            <FaCheckCircle />

            <span>
              {successMessage}
            </span>
          </div>
        )}

        {/* ==================================================
            CONTENT
        ================================================== */}

        <form
          className="admin-whatsapp-content"
          onSubmit={handleSave}
        >

          {/* =================================================
              ORDER WHATSAPP
          ================================================= */}

          <section className="admin-whatsapp-card">

            <div className="admin-whatsapp-card-header">

              <div className="admin-whatsapp-card-icon order">
                <FaWhatsapp />
              </div>

              <div>
                <h2>
                  Order on WhatsApp
                </h2>

                <p>
                  Configure the WhatsApp number
                  customers will use when placing
                  an order.
                </p>
              </div>

              <label className="admin-whatsapp-switch">

                <input
                  type="checkbox"
                  name="order_enabled"
                  checked={
                    settings.order_enabled
                  }
                  onChange={handleChange}
                />

                <span className="admin-whatsapp-slider" />

              </label>

            </div>

            <div className="admin-whatsapp-card-body">

              <div className="admin-whatsapp-form-group">

                <label htmlFor="order_phone">
                  Order WhatsApp Number
                </label>

                <input
                  id="order_phone"
                  name="order_phone"
                  type="text"
                  value={
                    settings.order_phone
                  }
                  onChange={handleChange}
                  placeholder="e.g. +92 300 1234567"
                  disabled={
                    !settings.order_enabled
                  }
                />

                <small>
                  Enter the WhatsApp number
                  customers should contact for
                  orders.
                </small>

              </div>

              <div className="admin-whatsapp-form-group">

                <label htmlFor="order_message">
                  Order Message
                </label>

                <textarea
                  id="order_message"
                  name="order_message"
                  rows="4"
                  value={
                    settings.order_message
                  }
                  onChange={handleChange}
                  placeholder="Enter the default order WhatsApp message..."
                  disabled={
                    !settings.order_enabled
                  }
                />

                <small>
                  This message can be used when
                  customers contact you about
                  their order.
                </small>

              </div>

            </div>

          </section>

          {/* =================================================
              PRODUCT WHATSAPP
          ================================================= */}

          <section className="admin-whatsapp-card">

            <div className="admin-whatsapp-card-header">

              <div className="admin-whatsapp-card-icon product">
                <FaWhatsapp />
              </div>

              <div>
                <h2>
                  Product WhatsApp Message
                </h2>

                <p>
                  Default message for customers
                  contacting WhatsApp from a
                  product page.
                </p>
              </div>

            </div>

            <div className="admin-whatsapp-card-body">

              <div className="admin-whatsapp-form-group">

                <label htmlFor="product_message">
                  Product Message
                </label>

                <textarea
                  id="product_message"
                  name="product_message"
                  rows="4"
                  value={
                    settings.product_message
                  }
                  onChange={handleChange}
                  placeholder="Enter the default product WhatsApp message..."
                />

                <small>
                  Product information can be
                  added to this message by the
                  customer-facing product page.
                </small>

              </div>

            </div>

          </section>

          {/* =================================================
              FLOATING WHATSAPP
          ================================================= */}

          <section className="admin-whatsapp-card">

            <div className="admin-whatsapp-card-header">

              <div className="admin-whatsapp-card-icon floating">
                <FaWhatsapp />
              </div>

              <div>
                <h2>
                  Floating WhatsApp Button
                </h2>

                <p>
                  Configure the WhatsApp button
                  shown at the bottom of the
                  customer website.
                </p>
              </div>

              <label className="admin-whatsapp-switch">

                <input
                  type="checkbox"
                  name="floating_enabled"
                  checked={
                    settings.floating_enabled
                  }
                  onChange={handleChange}
                />

                <span className="admin-whatsapp-slider" />

              </label>

            </div>

            <div className="admin-whatsapp-card-body">

              <div className="admin-whatsapp-two-column">

                <div className="admin-whatsapp-form-group">

                  <label htmlFor="floating_phone">
                    Floating WhatsApp Number
                  </label>

                  <input
                    id="floating_phone"
                    name="floating_phone"
                    type="text"
                    value={
                      settings.floating_phone
                    }
                    onChange={handleChange}
                    placeholder="e.g. +92 300 1234567"
                    disabled={
                      !settings.floating_enabled
                    }
                  />

                  <small>
                    This number will open when
                    customers click the floating
                    WhatsApp button.
                  </small>

                </div>

                <div className="admin-whatsapp-form-group">

                  <label htmlFor="floating_label">
                    Button Label
                  </label>

                  <input
                    id="floating_label"
                    name="floating_label"
                    type="text"
                    value={
                      settings.floating_label
                    }
                    onChange={handleChange}
                    placeholder="Chat on WhatsApp"
                    disabled={
                      !settings.floating_enabled
                    }
                  />

                  <small>
                    Text displayed beside the
                    floating WhatsApp icon.
                  </small>

                </div>

              </div>

              <div className="admin-whatsapp-form-group">

                <label htmlFor="floating_message">
                  Floating WhatsApp Message
                </label>

                <textarea
                  id="floating_message"
                  name="floating_message"
                  rows="4"
                  value={
                    settings.floating_message
                  }
                  onChange={handleChange}
                  placeholder="Enter the floating WhatsApp message..."
                  disabled={
                    !settings.floating_enabled
                  }
                />

              </div>

              <div className="admin-whatsapp-form-group">

                <label htmlFor="floating_position">
                  Button Position
                </label>

                <select
                  id="floating_position"
                  name="floating_position"
                  value={
                    settings.floating_position
                  }
                  onChange={handleChange}
                  disabled={
                    !settings.floating_enabled
                  }
                >
                  <option value="bottom-right">
                    Bottom Right
                  </option>

                  <option value="bottom-left">
                    Bottom Left
                  </option>
                </select>

                <small>
                  Choose where the floating
                  WhatsApp button should appear.
                </small>

              </div>

            </div>

          </section>

          {/* =================================================
              PREVIEW
          ================================================= */}

          <section className="admin-whatsapp-card admin-whatsapp-preview-card">

            <div className="admin-whatsapp-card-header">

              <div className="admin-whatsapp-card-icon preview">
                <FaWhatsapp />
              </div>

              <div>
                <h2>
                  Customer Preview
                </h2>

                <p>
                  Preview how the floating
                  WhatsApp button will appear.
                </p>
              </div>

            </div>

            <div className="admin-whatsapp-preview">

              <div className="admin-whatsapp-preview-browser">

                <div className="admin-whatsapp-preview-topbar">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="admin-whatsapp-preview-body">

                  <div className="admin-whatsapp-preview-product">

                    <div className="admin-whatsapp-preview-image" />

                    <div className="admin-whatsapp-preview-lines">

                      <span />
                      <span />
                      <span />

                    </div>

                  </div>

                  <div className="admin-whatsapp-preview-order-button">

                    <FaWhatsapp />

                    <span>
                      Order on WhatsApp
                    </span>

                  </div>

                  {settings.floating_enabled && (
                    <div
                      className={`admin-whatsapp-preview-floating ${
                        settings.floating_position ===
                        "bottom-left"
                          ? "left"
                          : "right"
                      }`}
                    >
                      <FaWhatsapp />

                      <span>
                        {
                          settings.floating_label ||
                          "Chat on WhatsApp"
                        }
                      </span>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="admin-whatsapp-actions">

            <button
              type="button"
              className="admin-whatsapp-reset-button"
              onClick={handleReset}
              disabled={
                saving ||
                resetting
              }
            >
              <FaUndo />

              <span>
                {resetting
                  ? "Resetting..."
                  : "Reset"}
              </span>
            </button>

            <button
              type="submit"
              className="admin-whatsapp-save-button"
              disabled={
                saving ||
                resetting
              }
            >
              <FaSave />

              <span>
                {saving
                  ? "Saving..."
                  : "Save Settings"}
              </span>
            </button>

          </div>

        </form>

      </div>
    </AdminLayout>
  );
};

export default AdminWhatsApp;