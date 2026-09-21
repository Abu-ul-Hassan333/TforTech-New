import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaEye,
  FaPalette,
  FaRedo,
  FaSave,
  FaStore,
  FaTimes,
} from "react-icons/fa";

import AdminLayout from "../AdminLayout/AdminLayout";
import { useTheme } from "../../context/ThemeContext";

import "./AdminTheme.css";

const API_URL = "http://127.0.0.1:8000";

/* ============================================================
   ORIGINAL GOJUNIORS DEFAULT THEME

   These values match the original storefront appearance.
============================================================ */

const DEFAULT_THEME = {
  site_name: "GoJuniors",

  primary_color: "#1f2937",
  secondary_color: "#3b82f6",
  accent_color: "#d69e78",

  background_color: "#ffffff",
  surface_color: "#f4f7fb",

  text_color: "#171717",
  muted_text_color: "#6b7280",

  button_text_color: "#ffffff",
  border_color: "#e5e7eb",

  header_background: "#ffffff",
  header_text_color: "#1f2937",

  footer_background: "#1f2937",
  footer_text_color: "#ffffff",

  font_family: "Inter",

  border_radius: "12px",
  button_radius: "8px",
  container_width: "1180px",

  show_site_name: true,
  show_footer: true,
  show_breadcrumbs: true,
};

/* ============================================================
   OLD BACKEND DEFAULT

   Older theme records may still contain these values.
   They are converted to the original GoJuniors defaults
   so the Theme page and storefront remain consistent.
============================================================ */

const LEGACY_BACKEND_DEFAULT_THEME = {
  site_name: "GoJuniors",

  primary_color: "#111827",
  secondary_color: "#2563eb",
  accent_color: "#25d366",

  background_color: "#ffffff",
  surface_color: "#f7f8fb",

  text_color: "#111827",
  muted_text_color: "#6b7280",

  button_text_color: "#ffffff",
  border_color: "#e5e7eb",

  header_background: "#111827",
  header_text_color: "#ffffff",

  footer_background: "#111827",
  footer_text_color: "#ffffff",

  font_family: "Inter",

  border_radius: "12px",
  button_radius: "8px",
  container_width: "1180px",

  show_site_name: true,
  show_footer: true,
  show_breadcrumbs: true,
};

/* ============================================================
   HELPERS
============================================================ */

const isLegacyDefaultTheme = (theme) => {
  if (!theme) {
    return false;
  }

  return Object.keys(LEGACY_BACKEND_DEFAULT_THEME).every(
    (key) =>
      theme[key] === LEGACY_BACKEND_DEFAULT_THEME[key]
  );
};

const normalizeTheme = (serverTheme) => {
  if (!serverTheme) {
    return {
      ...DEFAULT_THEME,
    };
  }

  if (isLegacyDefaultTheme(serverTheme)) {
    return {
      ...DEFAULT_THEME,
    };
  }

  return {
    ...DEFAULT_THEME,
    ...serverTheme,
  };
};

/* ============================================================
   FONT OPTIONS
============================================================ */

const FONT_OPTIONS = [
  "Inter",
  "Arial",
  "Helvetica",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Nunito",
];

/* ============================================================
   RADIUS OPTIONS
============================================================ */

const RADIUS_OPTIONS = [
  {
    label: "Sharp",
    value: "0px",
  },
  {
    label: "Small",
    value: "6px",
  },
  {
    label: "Medium",
    value: "12px",
  },
  {
    label: "Large",
    value: "18px",
  },
  {
    label: "Round",
    value: "28px",
  },
];

/* ============================================================
   ADMIN THEME
============================================================ */

const AdminTheme = () => {
  const navigate = useNavigate();

  /*
    Theme context is required so the freshly saved/reset
    theme can immediately propagate across the application.
  */

  const { refreshTheme } = useTheme();

  const [theme, setTheme] =
    useState({
      ...DEFAULT_THEME,
    });

  const [originalTheme, setOriginalTheme] =
    useState({
      ...DEFAULT_THEME,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [resetting, setResetting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showPreview, setShowPreview] =
    useState(false);

  /* ==========================================================
     AUTH HELPERS
  ========================================================== */

  const getUserRole = () => {
    return String(
      localStorage.getItem(
        "tfortech_user_role"
      ) || "customer"
    )
      .toLowerCase()
      .trim();
  };

  const getToken = () => {
    return localStorage.getItem(
      "tfortech_access_token"
    );
  };

  const handleAuthenticationFailure =
    useCallback(() => {
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

      navigate("/login");
    }, [navigate]);

  /* ==========================================================
     LOAD THEME
  ========================================================== */

  const fetchTheme = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const userRole =
          getUserRole();

        if (userRole !== "admin") {
          navigate("/");
          return;
        }

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/theme/settings`,
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
            "Access denied. Admin access is required to manage theme settings."
          );
          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to load theme settings."
          );
        }

        const loadedTheme = normalizeTheme(
          data?.theme
        );

        setTheme(loadedTheme);
        setOriginalTheme(loadedTheme);
      } catch (fetchError) {
        console.error(
          "Theme loading error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load theme settings."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      navigate,
      handleAuthenticationFailure,
    ]
  );

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  /* ==========================================================
     FIELD UPDATE
  ========================================================== */

  const updateTheme = (
    field,
    value
  ) => {
    setTheme((previousTheme) => ({
      ...previousTheme,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  /* ==========================================================
     COLOR UPDATE
  ========================================================== */

  const handleColorChange = (
    field,
    value
  ) => {
    updateTheme(field, value);
  };

  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSave = async () => {
    if (getUserRole() !== "admin") {
      navigate("/");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/theme/settings`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(theme),
        }
      );

      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }

      if (response.status === 403) {
        setError(
          "Access denied. Admin access is required to save theme settings."
        );
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to save theme settings."
        );
      }

      const savedTheme = normalizeTheme(
        data?.theme || theme
      );

      setTheme(savedTheme);
      setOriginalTheme(savedTheme);

      /*
        Refresh the global ThemeContext immediately.
        This makes the new theme apply to Customer +
        Admin pages without a manual page refresh.
      */

      await refreshTheme();

      setSuccess(
        "Theme settings saved successfully."
      );
    } catch (saveError) {
      console.error(
        "Theme save error:",
        saveError
      );

      setError(
        saveError.message ||
          "Unable to save theme settings."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = async () => {
    if (getUserRole() !== "admin") {
      navigate("/");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to reset the theme to default settings?"
      );

    if (!confirmed) {
      return;
    }

    setResetting(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/theme/settings/reset`,
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
          "Access denied. Admin access is required to reset the theme."
        );
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to reset theme."
        );
      }

      /*
        Normalize legacy backend reset response
        into the original storefront defaults.
      */

      const resetTheme = normalizeTheme(
        data?.theme
      );

      setTheme(resetTheme);
      setOriginalTheme(resetTheme);

      /*
        Refresh global theme state immediately.
        The original storefront colors return
        across Customer + Admin.
      */

      await refreshTheme();

      setSuccess(
        "Theme has been reset to default."
      );
    } catch (resetError) {
      console.error(
        "Theme reset error:",
        resetError
      );

      setError(
        resetError.message ||
          "Unable to reset theme."
      );
    } finally {
      setResetting(false);
    }
  };

  /* ==========================================================
     DISCARD CHANGES
  ========================================================== */

  const handleDiscard = () => {
    setTheme({
      ...originalTheme,
    });

    setError("");
    setSuccess("");
  };

  /* ==========================================================
     PREVIEW VARIABLES
  ========================================================== */

  const previewStyle = {
    "--theme-primary":
      theme.primary_color,

    "--theme-secondary":
      theme.secondary_color,

    "--theme-accent":
      theme.accent_color,

    "--theme-background":
      theme.background_color,

    "--theme-surface":
      theme.surface_color,

    "--theme-text":
      theme.text_color,

    "--theme-muted":
      theme.muted_text_color,

    "--theme-button-text":
      theme.button_text_color,

    "--theme-border":
      theme.border_color,

    "--theme-header":
      theme.header_background,

    "--theme-header-text":
      theme.header_text_color,

    "--theme-footer":
      theme.footer_background,

    "--theme-footer-text":
      theme.footer_text_color,

    "--theme-radius":
      theme.border_radius,

    "--theme-button-radius":
      theme.button_radius,

    "--theme-font":
      theme.font_family,

    "--theme-container-width":
      theme.container_width,
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-theme-page">
          <div className="admin-theme-loading">
            <div className="admin-theme-spinner" />

            <p>
              Loading theme settings...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <AdminLayout>
      <div className="admin-theme-page">

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="admin-theme-header">

          <div className="admin-theme-heading">

            <button
              type="button"
              className="admin-theme-back-button"
              onClick={() =>
                navigate("/admin")
              }
              aria-label="Back to dashboard"
            >
              <FaArrowLeft />
            </button>

            <div>
              <div className="admin-theme-title-row">

                <div className="admin-theme-title-icon">
                  <FaPalette />
                </div>

                <div>
                  <h1>
                    Theme
                  </h1>

                  <p>
                    Customize the look and feel
                    of your GoJuniors store.
                  </p>
                </div>

              </div>
            </div>

          </div>

          <div className="admin-theme-header-actions">

            <button
              type="button"
              className="admin-theme-preview-button"
              onClick={() =>
                setShowPreview(true)
              }
              disabled={
                saving ||
                resetting
              }
            >
              <FaEye />
              Preview
            </button>

            <button
              type="button"
              className="admin-theme-reset-button"
              onClick={handleReset}
              disabled={
                resetting ||
                saving
              }
            >
              <FaRedo
                className={
                  resetting
                    ? "admin-theme-spin"
                    : ""
                }
              />

              {resetting
                ? "Resetting..."
                : "Reset"}
            </button>

            <button
              type="button"
              className="admin-theme-save-button"
              onClick={handleSave}
              disabled={
                saving ||
                resetting
              }
            >
              <FaSave />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="admin-theme-alert admin-theme-alert-error">
            <FaTimes />

            <span>
              {error}
            </span>
          </div>
        )}

        {success && (
          <div className="admin-theme-alert admin-theme-alert-success">
            <FaCheck />

            <span>
              {success}
            </span>
          </div>
        )}

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="admin-theme-content">

          {/* ==================================================
              GENERAL
          ================================================== */}

          <section className="admin-theme-card">

            <div className="admin-theme-card-header">

              <div className="admin-theme-card-icon">
                <FaStore />
              </div>

              <div>
                <h2>
                  General
                </h2>

                <p>
                  Basic storefront appearance
                  and branding settings.
                </p>
              </div>

            </div>

            <div className="admin-theme-form-grid">

              <div className="admin-theme-field admin-theme-field-full">

                <label htmlFor="site_name">
                  Store Name
                </label>

                <input
                  id="site_name"
                  type="text"
                  value={
                    theme.site_name
                  }
                  onChange={(event) =>
                    updateTheme(
                      "site_name",
                      event.target.value
                    )
                  }
                  placeholder="GoJuniors"
                  maxLength={100}
                  disabled={
                    saving ||
                    resetting
                  }
                />

                <span className="admin-theme-field-help">
                  The name displayed throughout
                  your storefront.
                </span>

              </div>

              <div className="admin-theme-field">

                <label htmlFor="font_family">
                  Font Family
                </label>

                <select
                  id="font_family"
                  value={
                    theme.font_family
                  }
                  onChange={(event) =>
                    updateTheme(
                      "font_family",
                      event.target.value
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  {FONT_OPTIONS.map(
                    (font) => (
                      <option
                        key={font}
                        value={font}
                      >
                        {font}
                      </option>
                    )
                  )}
                </select>

              </div>

              <div className="admin-theme-field">

                <label htmlFor="container_width">
                  Content Width
                </label>

                <select
                  id="container_width"
                  value={
                    theme.container_width
                  }
                  onChange={(event) =>
                    updateTheme(
                      "container_width",
                      event.target.value
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  <option value="1000px">
                    Compact
                  </option>

                  <option value="1180px">
                    Standard
                  </option>

                  <option value="1280px">
                    Wide
                  </option>

                  <option value="1400px">
                    Extra Wide
                  </option>
                </select>

              </div>

            </div>

          </section>

          {/* ==================================================
              BRAND COLORS
          ================================================== */}

          <section className="admin-theme-card">

            <div className="admin-theme-card-header">

              <div className="admin-theme-card-icon">
                <FaPalette />
              </div>

              <div>
                <h2>
                  Brand Colors
                </h2>

                <p>
                  Choose the colors used across
                  your store.
                </p>
              </div>

            </div>

            <div className="admin-theme-color-grid">

              <div className="admin-theme-color-field">

                <label>
                  Primary Color
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.primary_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "primary_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Primary color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.primary_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "primary_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Primary color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-color-field">

                <label>
                  Secondary Color
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.secondary_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "secondary_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Secondary color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.secondary_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "secondary_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Secondary color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-color-field">

                <label>
                  Accent Color
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.accent_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "accent_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Accent color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.accent_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "accent_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Accent color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-color-field">

                <label>
                  Background Color
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.background_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "background_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Background color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.background_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "background_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Background color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-color-field">

                <label>
                  Surface Color
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.surface_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "surface_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Surface color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.surface_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "surface_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Surface color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-color-field">

                <label>
                  Text Color
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Text color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Text color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-color-field">

                <label>
                  Muted Text Color
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.muted_text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "muted_text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Muted text color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.muted_text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "muted_text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Muted text color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-color-field">

                <label>
                  Border Color
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.border_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "border_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Border color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.border_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "border_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Border color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-color-field">

                <label>
                  Button Text Color
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.button_text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "button_text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Button text color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.button_text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "button_text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Button text color hex value"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              HEADER / FOOTER
          ================================================== */}

          <section className="admin-theme-card">

            <div className="admin-theme-card-header">

              <div className="admin-theme-card-icon">
                <FaStore />
              </div>

              <div>
                <h2>
                  Header & Footer
                </h2>

                <p>
                  Customize the main navigation
                  and footer appearance.
                </p>
              </div>

            </div>

            <div className="admin-theme-form-grid">

              <div className="admin-theme-field">

                <label>
                  Header Background
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.header_background
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "header_background",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Header background color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.header_background
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "header_background",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Header background color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-field">

                <label>
                  Header Text
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.header_text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "header_text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Header text color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.header_text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "header_text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Header text color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-field">

                <label>
                  Footer Background
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.footer_background
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "footer_background",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Footer background color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.footer_background
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "footer_background",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Footer background color hex value"
                  />

                </div>

              </div>

              <div className="admin-theme-field">

                <label>
                  Footer Text
                </label>

                <div className="admin-theme-color-control">

                  <input
                    type="color"
                    value={
                      theme.footer_text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "footer_text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Footer text color picker"
                  />

                  <input
                    type="text"
                    value={
                      theme.footer_text_color
                    }
                    onChange={(event) =>
                      handleColorChange(
                        "footer_text_color",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    aria-label="Footer text color hex value"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              LAYOUT
          ================================================== */}

          <section className="admin-theme-card">

            <div className="admin-theme-card-header">

              <div className="admin-theme-card-icon">
                <FaPalette />
              </div>

              <div>
                <h2>
                  Layout & Style
                </h2>

                <p>
                  Control corner radius and
                  storefront presentation.
                </p>
              </div>

            </div>

            <div className="admin-theme-form-grid">

              <div className="admin-theme-field">

                <label htmlFor="border_radius">
                  Card Radius
                </label>

                <select
                  id="border_radius"
                  value={
                    theme.border_radius
                  }
                  onChange={(event) =>
                    updateTheme(
                      "border_radius",
                      event.target.value
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  {RADIUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>

              </div>

              <div className="admin-theme-field">

                <label htmlFor="button_radius">
                  Button Radius
                </label>

                <select
                  id="button_radius"
                  value={
                    theme.button_radius
                  }
                  onChange={(event) =>
                    updateTheme(
                      "button_radius",
                      event.target.value
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  {RADIUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>

              </div>

            </div>

          </section>

          {/* ==================================================
              DISPLAY SETTINGS
          ================================================== */}

          <section className="admin-theme-card">

            <div className="admin-theme-card-header">

              <div className="admin-theme-card-icon">
                <FaEye />
              </div>

              <div>
                <h2>
                  Display Settings
                </h2>

                <p>
                  Choose which storefront elements
                  should be visible.
                </p>
              </div>

            </div>

            <div className="admin-theme-toggle-list">

              <label className="admin-theme-toggle-row">

                <div>
                  <strong>
                    Show Store Name
                  </strong>

                  <span>
                    Display the store name in
                    supported storefront areas.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={
                    Boolean(
                      theme.show_site_name
                    )
                  }
                  onChange={(event) =>
                    updateTheme(
                      "show_site_name",
                      event.target.checked
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                />

              </label>

              <label className="admin-theme-toggle-row">

                <div>
                  <strong>
                    Show Breadcrumbs
                  </strong>

                  <span>
                    Display breadcrumb navigation
                    on supported pages.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={
                    Boolean(
                      theme.show_breadcrumbs
                    )
                  }
                  onChange={(event) =>
                    updateTheme(
                      "show_breadcrumbs",
                      event.target.checked
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                />

              </label>

              <label className="admin-theme-toggle-row">

                <div>
                  <strong>
                    Show Footer
                  </strong>

                  <span>
                    Display the storefront footer.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={
                    Boolean(
                      theme.show_footer
                    )
                  }
                  onChange={(event) =>
                    updateTheme(
                      "show_footer",
                      event.target.checked
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                />

              </label>

            </div>

          </section>

          {/* ==================================================
              BOTTOM ACTIONS
          ================================================== */}

          <div className="admin-theme-bottom-actions">

            <button
              type="button"
              className="admin-theme-discard-button"
              onClick={handleDiscard}
              disabled={
                saving ||
                resetting
              }
            >
              <FaTimes />
              Discard Changes
            </button>

            <button
              type="button"
              className="admin-theme-save-button admin-theme-save-button-bottom"
              onClick={handleSave}
              disabled={
                saving ||
                resetting
              }
            >
              <FaSave />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

        {/* ==================================================
            PREVIEW MODAL
        ================================================== */}

        {showPreview && (
          <div
            className="admin-theme-preview-overlay"
            onClick={() =>
              setShowPreview(false)
            }
          >
            <div
              className="admin-theme-preview-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="admin-theme-preview-modal-header">

                <div>
                  <span>
                    LIVE PREVIEW
                  </span>

                  <h2>
                    Storefront Preview
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPreview(false)
                  }
                  aria-label="Close preview"
                >
                  <FaTimes />
                </button>

              </div>

              <div
                className="admin-theme-store-preview"
                style={previewStyle}
              >

                <div className="admin-theme-preview-header">

                  {theme.show_site_name && (
                    <strong>
                      {theme.site_name ||
                        "GoJuniors"}
                    </strong>
                  )}

                  <div className="admin-theme-preview-nav">
                    <span>
                      Home
                    </span>

                    <span>
                      Products
                    </span>

                    <span>
                      Orders
                    </span>
                  </div>

                </div>

                {theme.show_breadcrumbs && (
                  <div className="admin-theme-preview-breadcrumb">
                    Home / Products
                  </div>
                )}

                <div className="admin-theme-preview-body">

                  <div className="admin-theme-preview-hero">

                    <span>
                      GOJUNIORS STORE
                    </span>

                    <h3>
                      Find Your Next Laptop
                    </h3>

                    <p>
                      Quality laptops for work,
                      study and everyday use.
                    </p>

                    <button
                      type="button"
                    >
                      Shop Now
                    </button>

                  </div>

                  <div className="admin-theme-preview-products">

                    <div className="admin-theme-preview-product-card">

                      <div className="admin-theme-preview-product-image">
                        Laptop
                      </div>

                      <div>
                        <h4>
                          Business Laptop
                        </h4>

                        <p>
                          Core i5 • 16GB RAM
                        </p>

                        <strong>
                          PKR 85,000
                        </strong>
                      </div>

                    </div>

                    <div className="admin-theme-preview-product-card">

                      <div className="admin-theme-preview-product-image">
                        Laptop
                      </div>

                      <div>
                        <h4>
                          Performance Laptop
                        </h4>

                        <p>
                          Core i7 • 16GB RAM
                        </p>

                        <strong>
                          PKR 125,000
                        </strong>
                      </div>

                    </div>

                  </div>

                </div>

                {theme.show_footer && (
                  <div className="admin-theme-preview-footer">
                    {theme.site_name ||
                      "GoJuniors"}{" "}
                    — All rights reserved.
                  </div>
                )}

              </div>

              <div className="admin-theme-preview-modal-footer">

                <button
                  type="button"
                  className="admin-theme-discard-button"
                  onClick={() =>
                    setShowPreview(false)
                  }
                >
                  Close Preview
                </button>

                <button
                  type="button"
                  className="admin-theme-save-button"
                  onClick={async () => {
                    setShowPreview(false);
                    await handleSave();
                  }}
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  <FaSave />
                  {saving
                    ? "Saving..."
                    : "Save Theme"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminTheme;