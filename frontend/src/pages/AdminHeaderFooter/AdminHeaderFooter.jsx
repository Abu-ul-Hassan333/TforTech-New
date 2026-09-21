import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaRedo,
  FaSave,
  FaTimes,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

import AdminLayout from "../AdminLayout/AdminLayout";

import "./AdminHeaderFooter.css";

const API_URL = "http://127.0.0.1:8000";

const DEFAULT_SETTINGS = {
  header: {
    announcement_text_1:
      "Free shipping on orders over PKR 5,000",
    announcement_text_2:
      "Pakistan & Middle East",
    logo_text_main:
      "T",
    logo_text_secondary:
      "For Tech",
  },

  footer: {
    site_name:
      "GoJuniors",

    description:
      "Discover comfortable clothing, playful toys and accessories made for curious minds and growing hearts.",

    social_links: {
      instagram:
        "https://instagram.com",
      facebook:
        "https://facebook.com",
      tiktok:
        "https://tiktok.com",
    },

    shop: {
      title:
        "Shop",

      links: [
        {
          label:
            "All Products",
          url:
            "/shop",
        },
        {
          label:
            "Categories",
          url:
            "/categories",
        },
        {
          label:
            "New Arrivals",
          url:
            "/shop",
        },
        {
          label:
            "Bestsellers",
          url:
            "/shop",
        },
        {
          label:
            "On Sale",
          url:
            "/shop",
        },
      ],
    },

    help: {
      title:
        "Help",

      links: [
        {
          label:
            "Shipping Information",
          url:
            "/shipping",
        },
        {
          label:
            "Returns & Exchanges",
          url:
            "/returns",
        },
        {
          label:
            "FAQs",
          url:
            "/faq",
        },
        {
          label:
            "Contact Us",
          url:
            "/contact",
        },
      ],
    },

    company: {
      title:
        "Company",

      links: [
        {
          label:
            "About Us",
          url:
            "/about",
        },
        {
          label:
            "Contact",
          url:
            "/contact",
        },
        {
          label:
            "Privacy Policy",
          url:
            "/privacy",
        },
        {
          label:
            "Terms & Conditions",
          url:
            "/terms",
        },
      ],
    },

    newsletter: {
      title:
        "Stay in the loop",

      description:
        "Subscribe for new arrivals, special offers and updates.",

      input_placeholder:
        "Your email address",

      button_text:
        "Subscribe",
    },

    delivery: {
      items: [
        {
          icon:
            "✓",
          title:
            "Quality Products",
          description:
            "Carefully selected for kids",
        },
        {
          icon:
            "🚚",
          title:
            "Free Shipping",
          description:
            "On orders over PKR 5,000",
        },
        {
          icon:
            "↩",
          title:
            "Easy Returns",
          description:
            "Simple return process",
        },
      ],
    },

    bottom: {
      copyright_text:
        "All rights reserved.",

      privacy_label:
        "Privacy",

      privacy_url:
        "/privacy",

      terms_label:
        "Terms",

      terms_url:
        "/terms",

      contact_label:
        "Contact",

      contact_url:
        "/contact",
    },
  },
};

const cloneSettings = (value) => {
  return JSON.parse(
    JSON.stringify(value)
  );
};

const normalizeSettings = (
  serverSettings
) => {
  if (!serverSettings) {
    return cloneSettings(
      DEFAULT_SETTINGS
    );
  }

  return {
    ...cloneSettings(
      DEFAULT_SETTINGS
    ),

    ...serverSettings,

    header: {
      ...cloneSettings(
        DEFAULT_SETTINGS.header
      ),
      ...(serverSettings.header || {}),
    },

    footer: {
      ...cloneSettings(
        DEFAULT_SETTINGS.footer
      ),
      ...(serverSettings.footer || {}),

      social_links: {
        ...cloneSettings(
          DEFAULT_SETTINGS.footer
            .social_links
        ),
        ...(serverSettings.footer
          ?.social_links || {}),
      },

      shop: {
        ...cloneSettings(
          DEFAULT_SETTINGS.footer.shop
        ),
        ...(serverSettings.footer?.shop ||
          {}),
      },

      help: {
        ...cloneSettings(
          DEFAULT_SETTINGS.footer.help
        ),
        ...(serverSettings.footer?.help ||
          {}),
      },

      company: {
        ...cloneSettings(
          DEFAULT_SETTINGS.footer.company
        ),
        ...(serverSettings.footer
          ?.company || {}),
      },

      newsletter: {
        ...cloneSettings(
          DEFAULT_SETTINGS.footer
            .newsletter
        ),
        ...(serverSettings.footer
          ?.newsletter || {}),
      },

      delivery: {
        ...cloneSettings(
          DEFAULT_SETTINGS.footer
            .delivery
        ),
        ...(serverSettings.footer
          ?.delivery || {}),
      },

      bottom: {
        ...cloneSettings(
          DEFAULT_SETTINGS.footer.bottom
        ),
        ...(serverSettings.footer
          ?.bottom || {}),
      },
    },
  };
};

const AdminHeaderFooter = () => {
  const navigate =
    useNavigate();

  const [
    settings,
    setSettings,
  ] = useState(
    cloneSettings(
      DEFAULT_SETTINGS
    )
  );

  const [
    originalSettings,
    setOriginalSettings,
  ] = useState(
    cloneSettings(
      DEFAULT_SETTINGS
    )
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    resetting,
    setResetting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

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

      navigate(
        "/login"
      );
    }, [navigate]);

  const loadSettings =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const userRole =
            getUserRole();

          if (
            userRole !== "admin"
          ) {
            navigate("/");
            return;
          }

          const token =
            getToken();

          if (!token) {
            navigate(
              "/login"
            );
            return;
          }

          const response =
            await fetch(
              `${API_URL}/api/header-footer/settings`,
              {
                method:
                  "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,

                  Accept:
                    "application/json",
                },
              }
            );

          if (
            response.status === 401
          ) {
            handleAuthenticationFailure();
            return;
          }

          if (
            response.status === 403
          ) {
            setError(
              "Access denied. Admin access is required to manage Header & Footer settings."
            );
            return;
          }

          const data =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              data?.detail ||
                "Unable to load Header & Footer settings."
            );
          }

          const loadedSettings =
            normalizeSettings(
              data?.settings
            );

          setSettings(
            loadedSettings
          );

          setOriginalSettings(
            cloneSettings(
              loadedSettings
            )
          );
        } catch (
          fetchError
        ) {
          console.error(
            "Header & Footer loading error:",
            fetchError
          );

          setError(
            fetchError.message ||
              "Unable to load Header & Footer settings."
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
    loadSettings();
  }, [loadSettings]);

  const updateHeader = (
    field,
    value
  ) => {
    setSettings(
      (previous) => ({
        ...previous,

        header: {
          ...previous.header,

          [field]:
            value,
        },
      })
    );

    setError("");
    setSuccess("");
  };

  const updateFooter = (
    field,
    value
  ) => {
    setSettings(
      (previous) => ({
        ...previous,

        footer: {
          ...previous.footer,

          [field]:
            value,
        },
      })
    );

    setError("");
    setSuccess("");
  };

  const updateSocial = (
    field,
    value
  ) => {
    setSettings(
      (previous) => ({
        ...previous,

        footer: {
          ...previous.footer,

          social_links: {
            ...previous.footer
              .social_links,

            [field]:
              value,
          },
        },
      })
    );

    setError("");
    setSuccess("");
  };

  const updateSectionTitle = (
    section,
    value
  ) => {
    setSettings(
      (previous) => ({
        ...previous,

        footer: {
          ...previous.footer,

          [section]: {
            ...previous.footer[
              section
            ],

            title:
              value,
          },
        },
      })
    );

    setError("");
    setSuccess("");
  };

  const updateSectionLink = (
    section,
    index,
    field,
    value
  ) => {
    setSettings(
      (previous) => {
        const links = [
          ...(previous.footer[
            section
          ].links || []),
        ];

        links[index] = {
          ...links[index],
          [field]:
            value,
        };

        return {
          ...previous,

          footer: {
            ...previous.footer,

            [section]: {
              ...previous.footer[
                section
              ],

              links,
            },
          },
        };
      }
    );

    setError("");
    setSuccess("");
  };

  const addSectionLink =
    (section) => {
      setSettings(
        (previous) => ({
          ...previous,

          footer: {
            ...previous.footer,

            [section]: {
              ...previous.footer[
                section
              ],

              links: [
                ...(previous.footer[
                  section
                ].links || []),

                {
                  label: "",
                  url: "",
                },
              ],
            },
          },
        })
      );

      setError("");
      setSuccess("");
    };

  const removeSectionLink = (
    section,
    index
  ) => {
    setSettings(
      (previous) => ({
        ...previous,

        footer: {
          ...previous.footer,

          [section]: {
            ...previous.footer[
              section
            ],

            links:
              previous.footer[
                section
              ].links.filter(
                (
                  _,
                  linkIndex
                ) =>
                  linkIndex !==
                  index
              ),
          },
        },
      })
    );

    setError("");
    setSuccess("");
  };

  const updateNewsletter = (
    field,
    value
  ) => {
    setSettings(
      (previous) => ({
        ...previous,

        footer: {
          ...previous.footer,

          newsletter: {
            ...previous.footer
              .newsletter,

            [field]:
              value,
          },
        },
      })
    );

    setError("");
    setSuccess("");
  };

  const updateDelivery = (
    index,
    field,
    value
  ) => {
    setSettings(
      (previous) => {
        const items = [
          ...(previous.footer
            .delivery.items || []),
        ];

        items[index] = {
          ...items[index],
          [field]:
            value,
        };

        return {
          ...previous,

          footer: {
            ...previous.footer,

            delivery: {
              ...previous.footer
                .delivery,

              items,
            },
          },
        };
      }
    );

    setError("");
    setSuccess("");
  };

  const addDelivery = () => {
    setSettings(
      (previous) => ({
        ...previous,

        footer: {
          ...previous.footer,

          delivery: {
            ...previous.footer
              .delivery,

            items: [
              ...(previous.footer
                .delivery.items ||
                []),

              {
                icon:
                  "✓",
                title:
                  "",
                description:
                  "",
              },
            ],
          },
        },
      })
    );

    setError("");
    setSuccess("");
  };

  const removeDelivery = (
    index
  ) => {
    setSettings(
      (previous) => ({
        ...previous,

        footer: {
          ...previous.footer,

          delivery: {
            ...previous.footer
              .delivery,

            items:
              previous.footer
                .delivery
                .items.filter(
                  (
                    _,
                    itemIndex
                  ) =>
                    itemIndex !==
                    index
                ),
          },
        },
      })
    );

    setError("");
    setSuccess("");
  };

  const updateBottom = (
    field,
    value
  ) => {
    setSettings(
      (previous) => ({
        ...previous,

        footer: {
          ...previous.footer,

          bottom: {
            ...previous.footer
              .bottom,

            [field]:
              value,
          },
        },
      })
    );

    setError("");
    setSuccess("");
  };

  const handleSave =
    async () => {
      if (
        getUserRole() !==
        "admin"
      ) {
        navigate("/");
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      try {
        const token =
          getToken();

        if (!token) {
          navigate(
            "/login"
          );
          return;
        }

        const cleanedSettings =
          normalizeSettings(
            settings
          );

        const response =
          await fetch(
            `${API_URL}/api/header-footer/settings`,
            {
              method:
                "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  cleanedSettings
                ),
            }
          );

        if (
          response.status === 401
        ) {
          handleAuthenticationFailure();
          return;
        }

        if (
          response.status === 403
        ) {
          setError(
            "Access denied. Admin access is required to save Header & Footer settings."
          );
          return;
        }

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.detail ||
              "Unable to save Header & Footer settings."
          );
        }

        const savedSettings =
          normalizeSettings(
            data?.settings ||
              cleanedSettings
          );

        setSettings(
          savedSettings
        );

        setOriginalSettings(
          cloneSettings(
            savedSettings
          )
        );

        setSuccess(
          data?.message ||
            "Header & Footer settings saved successfully."
        );
      } catch (
        saveError
      ) {
        console.error(
          "Header & Footer save error:",
          saveError
        );

        setError(
          saveError.message ||
            "Unable to save Header & Footer settings."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleReset =
    async () => {
      if (
        getUserRole() !==
        "admin"
      ) {
        navigate("/");
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to reset all Header & Footer settings to their default values?"
        );

      if (!confirmed) {
        return;
      }

      setResetting(true);
      setError("");
      setSuccess("");

      try {
        const token =
          getToken();

        if (!token) {
          navigate(
            "/login"
          );
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/header-footer/settings/reset`,
            {
              method:
                "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

        if (
          response.status === 401
        ) {
          handleAuthenticationFailure();
          return;
        }

        if (
          response.status === 403
        ) {
          setError(
            "Access denied. Admin access is required to reset Header & Footer settings."
          );
          return;
        }

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.detail ||
              "Unable to reset Header & Footer settings."
          );
        }

        const resetSettings =
          normalizeSettings(
            data?.settings ||
              DEFAULT_SETTINGS
          );

        setSettings(
          resetSettings
        );

        setOriginalSettings(
          cloneSettings(
            resetSettings
          )
        );

        setSuccess(
          data?.message ||
            "Header & Footer settings have been reset to default."
        );
      } catch (
        resetError
      ) {
        console.error(
          "Header & Footer reset error:",
          resetError
        );

        setError(
          resetError.message ||
            "Unable to reset Header & Footer settings."
        );
      } finally {
        setResetting(false);
      }
    };

  const handleDiscard =
    () => {
      setSettings(
        cloneSettings(
          originalSettings
        )
      );

      setError("");
      setSuccess("");
    };

  const renderSection = (
    section,
    heading
  ) => {
    const sectionData =
      settings.footer[
        section
      ];

    return (
      <div className="admin-header-footer-card">

        <div className="admin-header-footer-card-header">

          <div>
            <h3>
              {heading}
            </h3>

            <p>
              Manage the heading and links
              shown in this footer section.
            </p>
          </div>

        </div>

        <div className="admin-header-footer-field">

          <label>
            Section Title
          </label>

          <input
            type="text"
            value={
              sectionData.title
            }
            onChange={(
              event
            ) =>
              updateSectionTitle(
                section,
                event.target.value
              )
            }
            disabled={
              saving ||
              resetting
            }
            placeholder="Section title"
            maxLength={100}
          />

        </div>

        <div className="admin-header-footer-links">

          {(
            sectionData.links ||
            []
          ).map(
            (
              link,
              index
            ) => (
              <div
                className="admin-header-footer-link-row"
                key={`${section}-${index}`}
              >

                <div className="admin-header-footer-link-number">
                  {index + 1}
                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Label
                  </label>

                  <input
                    type="text"
                    value={
                      link.label
                    }
                    onChange={(
                      event
                    ) =>
                      updateSectionLink(
                        section,
                        index,
                        "label",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="Link label"
                    maxLength={100}
                  />

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    URL
                  </label>

                  <input
                    type="text"
                    value={
                      link.url
                    }
                    onChange={(
                      event
                    ) =>
                      updateSectionLink(
                        section,
                        index,
                        "url",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="/example"
                    maxLength={500}
                  />

                </div>

                <button
                  type="button"
                  className="admin-header-footer-danger-button"
                  onClick={() =>
                    removeSectionLink(
                      section,
                      index
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  <FaTrash />
                  Remove
                </button>

              </div>
            )
          )}

        </div>

        <button
          type="button"
          className="admin-header-footer-secondary-button"
          onClick={() =>
            addSectionLink(
              section
            )
          }
          disabled={
            saving ||
            resetting
          }
        >
          <FaPlus />
          Add Link
        </button>

      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>

        <div className="admin-header-footer-page">

          <div className="admin-header-footer-loading">

            <div className="admin-header-footer-spinner" />

            <h2>
              Loading Header & Footer Settings...
            </h2>

            <p>
              Please wait while the saved settings
              are being loaded.
            </p>

          </div>

        </div>

      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <div className="admin-header-footer-page">

        <div className="admin-header-footer-container">

          <div className="admin-header-footer-topbar">

            <div>

              <span className="admin-header-footer-eyebrow">
                Website Management
              </span>

              <h1>
                Header & Footer Management
              </h1>

              <p>
                Manage the information displayed in the
                customer-facing header and footer.
              </p>

            </div>

            <div className="admin-header-footer-actions">

              <button
                type="button"
                className="admin-header-footer-reset-button"
                onClick={
                  handleReset
                }
                disabled={
                  saving ||
                  resetting
                }
              >
                <FaRedo />

                {resetting
                  ? "Resetting..."
                  : "Reset to Default"}
              </button>

              <button
                type="button"
                className="admin-header-footer-save-button"
                onClick={
                  handleSave
                }
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

          {success && (
            <div className="admin-header-footer-success">

              <FaCheck />

              <span>
                {success}
              </span>

            </div>
          )}

          {error && (
            <div className="admin-header-footer-error">

              <FaTimes />

              <span>
                {error}
              </span>

            </div>
          )}

          <div className="admin-header-footer-section">

            <div className="admin-header-footer-section-heading">

              <span>
                01
              </span>

              <div>
                <h2>
                  Header Information
                </h2>

                <p>
                  Update the announcement text and logo
                  information used by the website header.
                </p>
              </div>

            </div>

            <div className="admin-header-footer-grid">

              <div className="admin-header-footer-card">

                <div className="admin-header-footer-card-header">

                  <div>
                    <h3>
                      Announcement Bar
                    </h3>

                    <p>
                      Manage both announcement messages
                      displayed in the header.
                    </p>
                  </div>

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Announcement Text 1
                  </label>

                  <input
                    type="text"
                    value={
                      settings.header
                        .announcement_text_1
                    }
                    onChange={(
                      event
                    ) =>
                      updateHeader(
                        "announcement_text_1",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="Free shipping message"
                    maxLength={250}
                  />

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Announcement Text 2
                  </label>

                  <input
                    type="text"
                    value={
                      settings.header
                        .announcement_text_2
                    }
                    onChange={(
                      event
                    ) =>
                      updateHeader(
                        "announcement_text_2",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="Location or service message"
                    maxLength={250}
                  />

                </div>

              </div>

              <div className="admin-header-footer-card">

                <div className="admin-header-footer-card-header">

                  <div>
                    <h3>
                      Logo Text
                    </h3>

                    <p>
                      Manage the two text parts shown
                      in the existing header logo.
                    </p>
                  </div>

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Logo Main Text
                  </label>

                  <input
                    type="text"
                    value={
                      settings.header
                        .logo_text_main
                    }
                    onChange={(
                      event
                    ) =>
                      updateHeader(
                        "logo_text_main",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="T"
                    maxLength={50}
                  />

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Logo Secondary Text
                  </label>

                  <input
                    type="text"
                    value={
                      settings.header
                        .logo_text_secondary
                    }
                    onChange={(
                      event
                    ) =>
                      updateHeader(
                        "logo_text_secondary",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="For Tech"
                    maxLength={100}
                  />

                </div>

              </div>

            </div>

          </div>

          <div className="admin-header-footer-section">

            <div className="admin-header-footer-section-heading">

              <span>
                02
              </span>

              <div>
                <h2>
                  Footer Information
                </h2>

                <p>
                  Manage footer branding, description,
                  social links and content sections.
                </p>
              </div>

            </div>

            <div className="admin-header-footer-grid">

              <div className="admin-header-footer-card">

                <div className="admin-header-footer-card-header">

                  <div>
                    <h3>
                      Footer Branding
                    </h3>

                    <p>
                      Change the footer site name
                      and description.
                    </p>
                  </div>

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Site Name
                  </label>

                  <input
                    type="text"
                    value={
                      settings.footer
                        .site_name
                    }
                    onChange={(
                      event
                    ) =>
                      updateFooter(
                        "site_name",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="GoJuniors"
                    maxLength={100}
                  />

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Description
                  </label>

                  <textarea
                    rows="5"
                    value={
                      settings.footer
                        .description
                    }
                    onChange={(
                      event
                    ) =>
                      updateFooter(
                        "description",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="Footer description"
                    maxLength={1000}
                  />

                </div>

              </div>

              <div className="admin-header-footer-card">

                <div className="admin-header-footer-card-header">

                  <div>
                    <h3>
                      Social Links
                    </h3>

                    <p>
                      Manage the social media links
                      shown in the footer.
                    </p>
                  </div>

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Instagram URL
                  </label>

                  <input
                    type="text"
                    value={
                      settings.footer
                        .social_links
                        .instagram
                    }
                    onChange={(
                      event
                    ) =>
                      updateSocial(
                        "instagram",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="https://instagram.com"
                    maxLength={500}
                  />

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Facebook URL
                  </label>

                  <input
                    type="text"
                    value={
                      settings.footer
                        .social_links
                        .facebook
                    }
                    onChange={(
                      event
                    ) =>
                      updateSocial(
                        "facebook",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="https://facebook.com"
                    maxLength={500}
                  />

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    TikTok URL
                  </label>

                  <input
                    type="text"
                    value={
                      settings.footer
                        .social_links
                        .tiktok
                    }
                    onChange={(
                      event
                    ) =>
                      updateSocial(
                        "tiktok",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="https://tiktok.com"
                    maxLength={500}
                  />

                </div>

              </div>

            </div>

            <div className="admin-header-footer-stack">

              {renderSection(
                "shop",
                "Shop Links"
              )}

              {renderSection(
                "help",
                "Help Links"
              )}

              {renderSection(
                "company",
                "Company Links"
              )}

            </div>

          </div>

          <div className="admin-header-footer-section">

            <div className="admin-header-footer-section-heading">

              <span>
                03
              </span>

              <div>
                <h2>
                  Newsletter
                </h2>

                <p>
                  Manage the newsletter heading,
                  description and subscribe controls.
                </p>
              </div>

            </div>

            <div className="admin-header-footer-card">

              <div className="admin-header-footer-grid">

                <div className="admin-header-footer-field">

                  <label>
                    Newsletter Title
                  </label>

                  <input
                    type="text"
                    value={
                      settings.footer
                        .newsletter
                        .title
                    }
                    onChange={(
                      event
                    ) =>
                      updateNewsletter(
                        "title",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="Stay in the loop"
                    maxLength={150}
                  />

                </div>

                <div className="admin-header-footer-field">

                  <label>
                    Button Text
                  </label>

                  <input
                    type="text"
                    value={
                      settings.footer
                        .newsletter
                        .button_text
                    }
                    onChange={(
                      event
                    ) =>
                      updateNewsletter(
                        "button_text",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="Subscribe"
                    maxLength={100}
                  />

                </div>

                <div className="admin-header-footer-field admin-header-footer-field-wide">

                  <label>
                    Newsletter Description
                  </label>

                  <textarea
                    rows="4"
                    value={
                      settings.footer
                        .newsletter
                        .description
                    }
                    onChange={(
                      event
                    ) =>
                      updateNewsletter(
                        "description",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="Newsletter description"
                    maxLength={500}
                  />

                </div>

                <div className="admin-header-footer-field admin-header-footer-field-wide">

                  <label>
                    Input Placeholder
                  </label>

                  <input
                    type="text"
                    value={
                      settings.footer
                        .newsletter
                        .input_placeholder
                    }
                    onChange={(
                      event
                    ) =>
                      updateNewsletter(
                        "input_placeholder",
                        event.target.value
                      )
                    }
                    disabled={
                      saving ||
                      resetting
                    }
                    placeholder="Your email address"
                    maxLength={150}
                  />

                </div>

              </div>

            </div>

          </div>

          <div className="admin-header-footer-section">

            <div className="admin-header-footer-section-heading">

              <span>
                04
              </span>

              <div>
                <h2>
                  Delivery Features
                </h2>

                <p>
                  Manage the delivery information strip
                  displayed in the footer.
                </p>
              </div>

            </div>

            <div className="admin-header-footer-card">

              <div className="admin-header-footer-card-header">

                <div>
                  <h3>
                    Delivery Items
                  </h3>

                  <p>
                    Add, edit or remove the feature
                    items shown in the footer.
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-header-footer-secondary-button"
                  onClick={
                    addDelivery
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                >
                  <FaPlus />
                  Add Item
                </button>

              </div>

              <div className="admin-header-footer-delivery-list">

                {(
                  settings.footer
                    .delivery
                    .items || []
                ).map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="admin-header-footer-delivery-row"
                      key={`delivery-${index}`}
                    >

                      <div className="admin-header-footer-delivery-icon-field">

                        <label>
                          Icon
                        </label>

                        <input
                          type="text"
                          value={
                            item.icon
                          }
                          onChange={(
                            event
                          ) =>
                            updateDelivery(
                              index,
                              "icon",
                              event.target.value
                            )
                          }
                          disabled={
                            saving ||
                            resetting
                          }
                          placeholder="✓"
                          maxLength={20}
                        />

                      </div>

                      <div className="admin-header-footer-field">

                        <label>
                          Title
                        </label>

                        <input
                          type="text"
                          value={
                            item.title
                          }
                          onChange={(
                            event
                          ) =>
                            updateDelivery(
                              index,
                              "title",
                              event.target.value
                            )
                          }
                          disabled={
                            saving ||
                            resetting
                          }
                          placeholder="Quality Products"
                          maxLength={100}
                        />

                      </div>

                      <div className="admin-header-footer-field">

                        <label>
                          Description
                        </label>

                        <input
                          type="text"
                          value={
                            item.description
                          }
                          onChange={(
                            event
                          ) =>
                            updateDelivery(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                          disabled={
                            saving ||
                            resetting
                          }
                          placeholder="Carefully selected products"
                          maxLength={250}
                        />

                      </div>

                      <button
                        type="button"
                        className="admin-header-footer-danger-button"
                        onClick={() =>
                          removeDelivery(
                            index
                          )
                        }
                        disabled={
                          saving ||
                          resetting
                        }
                      >
                        <FaTrash />
                        Remove
                      </button>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

          <div className="admin-header-footer-section">

            <div className="admin-header-footer-section-heading">

              <span>
                05
              </span>

              <div>
                <h2>
                  Footer Bottom Bar
                </h2>

                <p>
                  Manage the copyright text and bottom
                  navigation labels and URLs.
                </p>
              </div>

            </div>

            <div className="admin-header-footer-card">

              <div className="admin-header-footer-field">

                <label>
                  Copyright Text
                </label>

                <input
                  type="text"
                  value={
                    settings.footer
                      .bottom
                      .copyright_text
                  }
                  onChange={(
                    event
                  ) =>
                    updateBottom(
                      "copyright_text",
                      event.target.value
                    )
                  }
                  disabled={
                    saving ||
                    resetting
                  }
                  placeholder="All rights reserved."
                  maxLength={250}
                />

              </div>

              <div className="admin-header-footer-grid">

                <div className="admin-header-footer-card-inner">

                  <h4>
                    Privacy
                  </h4>

                  <div className="admin-header-footer-field">

                    <label>
                      Label
                    </label>

                    <input
                      type="text"
                      value={
                        settings.footer
                          .bottom
                          .privacy_label
                      }
                      onChange={(
                        event
                      ) =>
                        updateBottom(
                          "privacy_label",
                          event.target.value
                        )
                      }
                      disabled={
                        saving ||
                        resetting
                      }
                      placeholder="Privacy"
                      maxLength={100}
                    />

                  </div>

                  <div className="admin-header-footer-field">

                    <label>
                      URL
                    </label>

                    <input
                      type="text"
                      value={
                        settings.footer
                          .bottom
                          .privacy_url
                      }
                      onChange={(
                        event
                      ) =>
                        updateBottom(
                          "privacy_url",
                          event.target.value
                        )
                      }
                      disabled={
                        saving ||
                        resetting
                      }
                      placeholder="/privacy"
                      maxLength={500}
                    />

                  </div>

                </div>

                <div className="admin-header-footer-card-inner">

                  <h4>
                    Terms
                  </h4>

                  <div className="admin-header-footer-field">

                    <label>
                      Label
                    </label>

                    <input
                      type="text"
                      value={
                        settings.footer
                          .bottom
                          .terms_label
                      }
                      onChange={(
                        event
                      ) =>
                        updateBottom(
                          "terms_label",
                          event.target.value
                        )
                      }
                      disabled={
                        saving ||
                        resetting
                      }
                      placeholder="Terms"
                      maxLength={100}
                    />

                  </div>

                  <div className="admin-header-footer-field">

                    <label>
                      URL
                    </label>

                    <input
                      type="text"
                      value={
                        settings.footer
                          .bottom
                          .terms_url
                      }
                      onChange={(
                        event
                      ) =>
                        updateBottom(
                          "terms_url",
                          event.target.value
                        )
                      }
                      disabled={
                        saving ||
                        resetting
                      }
                      placeholder="/terms"
                      maxLength={500}
                    />

                  </div>

                </div>

                <div className="admin-header-footer-card-inner">

                  <h4>
                    Contact
                  </h4>

                  <div className="admin-header-footer-field">

                    <label>
                      Label
                    </label>

                    <input
                      type="text"
                      value={
                        settings.footer
                          .bottom
                          .contact_label
                      }
                      onChange={(
                        event
                      ) =>
                        updateBottom(
                          "contact_label",
                          event.target.value
                        )
                      }
                      disabled={
                        saving ||
                        resetting
                      }
                      placeholder="Contact"
                      maxLength={100}
                    />

                  </div>

                  <div className="admin-header-footer-field">

                    <label>
                      URL
                    </label>

                    <input
                      type="text"
                      value={
                        settings.footer
                          .bottom
                          .contact_url
                      }
                      onChange={(
                        event
                      ) =>
                        updateBottom(
                          "contact_url",
                          event.target.value
                        )
                      }
                      disabled={
                        saving ||
                        resetting
                      }
                      placeholder="/contact"
                      maxLength={500}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="admin-header-footer-bottom-actions">

            <button
              type="button"
              className="admin-header-footer-reset-button"
              onClick={
                handleDiscard
              }
              disabled={
                saving ||
                resetting
              }
            >
              <FaArrowLeft />
              Discard Changes
            </button>

            <button
              type="button"
              className="admin-header-footer-save-button"
              onClick={
                handleSave
              }
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

      </div>

    </AdminLayout>
  );
};

export default AdminHeaderFooter;