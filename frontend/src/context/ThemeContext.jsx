import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const API_URL = "http://127.0.0.1:8000";

/* ============================================================
   EXISTING WEBSITE DEFAULT COLORS
   These values preserve the original GoJuniors storefront.
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
   This was saved before the theme system was aligned.
   It must not activate the customer/admin custom theme.
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

const ThemeContext = createContext(null);

/* ============================================================
   CHECK LEGACY BACKEND DEFAULT
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

/* ============================================================
   CHECK REAL CUSTOM THEME
============================================================ */

const isCustomTheme = (theme) => {
  if (!theme) {
    return false;
  }

  /*
    The old backend default is considered untouched
    and must never activate custom theme overrides.
  */

  if (isLegacyDefaultTheme(theme)) {
    return false;
  }

  /*
    Compare only actual theme settings.
    Extra backend fields such as _id / updated_at
    are intentionally ignored.
  */

  return Object.keys(DEFAULT_THEME).some(
    (key) => theme[key] !== DEFAULT_THEME[key]
  );
};

/* ============================================================
   APPLY CSS VARIABLES
============================================================ */

const applyThemeVariables = (theme) => {
  const root = document.documentElement;

  root.style.setProperty(
    "--gojuniors-primary-color",
    theme.primary_color
  );

  root.style.setProperty(
    "--gojuniors-secondary-color",
    theme.secondary_color
  );

  root.style.setProperty(
    "--gojuniors-accent-color",
    theme.accent_color
  );

  root.style.setProperty(
    "--gojuniors-background-color",
    theme.background_color
  );

  root.style.setProperty(
    "--gojuniors-surface-color",
    theme.surface_color
  );

  root.style.setProperty(
    "--gojuniors-text-color",
    theme.text_color
  );

  root.style.setProperty(
    "--gojuniors-muted-text-color",
    theme.muted_text_color
  );

  root.style.setProperty(
    "--gojuniors-button-text-color",
    theme.button_text_color
  );

  root.style.setProperty(
    "--gojuniors-border-color",
    theme.border_color
  );

  root.style.setProperty(
    "--gojuniors-header-background",
    theme.header_background
  );

  root.style.setProperty(
    "--gojuniors-header-text-color",
    theme.header_text_color
  );

  root.style.setProperty(
    "--gojuniors-footer-background",
    theme.footer_background
  );

  root.style.setProperty(
    "--gojuniors-footer-text-color",
    theme.footer_text_color
  );

  root.style.setProperty(
    "--gojuniors-font-family",
    theme.font_family
  );

  root.style.setProperty(
    "--gojuniors-border-radius",
    theme.border_radius
  );

  root.style.setProperty(
    "--gojuniors-button-radius",
    theme.button_radius
  );

  root.style.setProperty(
    "--gojuniors-container-width",
    theme.container_width
  );

  root.style.setProperty(
    "--gojuniors-site-name",
    theme.site_name
  );
};

/* ============================================================
   CLEAR INLINE THEME VARIABLES

   index.css :root values remain as the safe storefront
   defaults after inline custom values are removed.
============================================================ */

const clearThemeVariables = () => {
  const root = document.documentElement;

  const variableNames = [
    "--gojuniors-primary-color",
    "--gojuniors-secondary-color",
    "--gojuniors-accent-color",
    "--gojuniors-background-color",
    "--gojuniors-surface-color",
    "--gojuniors-text-color",
    "--gojuniors-muted-text-color",
    "--gojuniors-button-text-color",
    "--gojuniors-border-color",
    "--gojuniors-header-background",
    "--gojuniors-header-text-color",
    "--gojuniors-footer-background",
    "--gojuniors-footer-text-color",
    "--gojuniors-font-family",
    "--gojuniors-border-radius",
    "--gojuniors-button-radius",
    "--gojuniors-container-width",
    "--gojuniors-site-name",
  ];

  variableNames.forEach((variableName) => {
    root.style.removeProperty(variableName);
  });
};

/* ============================================================
   THEME PROVIDER
============================================================ */

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [customThemeActive, setCustomThemeActive] =
    useState(false);

  /* ==========================================================
     LOAD PUBLIC THEME
  ========================================================== */

  const fetchPublicTheme = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/theme/public`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Theme API returned status ${response.status}.`
        );
      }

      const data = await response.json();

      const serverTheme = data?.theme || null;

      /*
        No saved theme or old backend default:
        restore the original GoJuniors appearance.
      */

      if (
        !serverTheme ||
        isLegacyDefaultTheme(serverTheme)
      ) {
        setTheme(DEFAULT_THEME);
        setCustomThemeActive(false);
        return;
      }

      /*
        Merge server values over safe defaults.
        This protects against missing optional fields.
      */

      const loadedTheme = {
        ...DEFAULT_THEME,
        ...serverTheme,
      };

      const hasCustomTheme =
        isCustomTheme(loadedTheme);

      setTheme(loadedTheme);
      setCustomThemeActive(hasCustomTheme);
    } catch (error) {
      console.error(
        "Public theme loading error:",
        error
      );

      /*
        Theme failure must never break the website.
      */

      setTheme(DEFAULT_THEME);
      setCustomThemeActive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchPublicTheme();
  }, [fetchPublicTheme]);

  /* ==========================================================
     APPLY THEME SITE-WIDE
     
     IMPORTANT:
     This applies to BOTH customer and admin pages.
  ========================================================== */

  useEffect(() => {
    if (customThemeActive) {
      document.body.classList.add(
        "gojuniors-theme-active"
      );

      applyThemeVariables(theme);
    } else {
      document.body.classList.remove(
        "gojuniors-theme-active"
      );

      clearThemeVariables();
    }
  }, [theme, customThemeActive]);

  /* ==========================================================
     CLEANUP WHEN THEME PROVIDER IS UNMOUNTED
  ========================================================== */

  useEffect(() => {
    return () => {
      document.body.classList.remove(
        "gojuniors-theme-active"
      );

      clearThemeVariables();
    };
  }, []);

  /* ==========================================================
     CONTEXT VALUE
  ========================================================== */

  const value = useMemo(
    () => ({
      theme,
      loading,
      customThemeActive,
      refreshTheme: fetchPublicTheme,
    }),
    [
      theme,
      loading,
      customThemeActive,
      fetchPublicTheme,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/* ============================================================
   USE THEME
============================================================ */

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider."
    );
  }

  return context;
};

export default ThemeContext;