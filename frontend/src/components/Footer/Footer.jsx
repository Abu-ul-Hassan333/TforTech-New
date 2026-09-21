import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";

import "./Footer.css";


const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const API_URL =
  `${BACKEND_URL}/api`;


const DEFAULT_FOOTER_SETTINGS = {
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


const cloneDefaults = () => {
  return JSON.parse(
    JSON.stringify(
      DEFAULT_FOOTER_SETTINGS
    )
  );
};


const normalizeFooterSettings = (
  serverSettings
) => {
  if (!serverSettings) {
    return cloneDefaults();
  }

  const defaults =
    cloneDefaults();

  return {
    ...defaults,

    ...serverSettings,

    footer: {
      ...defaults.footer,

      ...(serverSettings.footer || {}),

      social_links: {
        ...defaults.footer
          .social_links,

        ...(serverSettings.footer
          ?.social_links || {}),
      },

      shop: {
        ...defaults.footer.shop,

        ...(serverSettings.footer
          ?.shop || {}),

        links:
          Array.isArray(
            serverSettings.footer
              ?.shop?.links
          )
            ? serverSettings.footer.shop.links
            : defaults.footer.shop.links,
      },

      help: {
        ...defaults.footer.help,

        ...(serverSettings.footer
          ?.help || {}),

        links:
          Array.isArray(
            serverSettings.footer
              ?.help?.links
          )
            ? serverSettings.footer.help.links
            : defaults.footer.help.links,
      },

      company: {
        ...defaults.footer.company,

        ...(serverSettings.footer
          ?.company || {}),

        links:
          Array.isArray(
            serverSettings.footer
              ?.company?.links
          )
            ? serverSettings.footer.company.links
            : defaults.footer.company.links,
      },

      newsletter: {
        ...defaults.footer.newsletter,

        ...(serverSettings.footer
          ?.newsletter || {}),
      },

      delivery: {
        ...defaults.footer.delivery,

        ...(serverSettings.footer
          ?.delivery || {}),

        items:
          Array.isArray(
            serverSettings.footer
              ?.delivery?.items
          )
            ? serverSettings.footer.delivery.items
            : defaults.footer.delivery.items,
      },

      bottom: {
        ...defaults.footer.bottom,

        ...(serverSettings.footer
          ?.bottom || {}),
      },
    },
  };
};


const isExternalUrl = (
  url
) => {
  return (
    typeof url === "string" &&
    /^(https?:\/\/|mailto:|tel:)/i.test(
      url.trim()
    )
  );
};


const FooterLink = ({
  label,
  url,
}) => {
  const safeLabel =
    label || "";

  const safeUrl =
    url || "#";

  if (
    isExternalUrl(
      safeUrl
    )
  ) {
    return (
      <a
        href={safeUrl}
        target="_blank"
        rel="noreferrer"
      >
        {safeLabel}
      </a>
    );
  }

  return (
    <Link to={safeUrl}>
      {safeLabel}
    </Link>
  );
};


function Footer() {
  const location =
    useLocation();

  const {
    theme,
  } = useTheme();


  const [
    footerSettings,
    setFooterSettings,
  ] = useState(
    cloneDefaults()
  );


  const handleNewsletterSubmit = (
    event
  ) => {
    event.preventDefault();
  };


  const isAdminPage =
    location.pathname === "/admin" ||
    location.pathname.startsWith(
      "/admin/"
    );


  const showFooter =
    isAdminPage ||
    theme.show_footer !== false;


  const loadFooterSettings =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/header-footer/public`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          if (
            !response.ok
          ) {
            return;
          }

          const data =
            await response.json();

          if (
            data?.settings
          ) {
            setFooterSettings(
              normalizeFooterSettings(
                data.settings
              )
            );
          }
        } catch (
          error
        ) {
          console.error(
            "Footer settings loading error:",
            error
          );
        }
      },
      []
    );


  useEffect(() => {
    loadFooterSettings();
  }, [
    loadFooterSettings,
  ]);


  if (!showFooter) {
    return null;
  }


  const footer =
    footerSettings.footer ||
    DEFAULT_FOOTER_SETTINGS.footer;


  const siteName =
    footer.site_name ||
    theme.site_name ||
    "GoJuniors";


  return (
    <footer className="site-footer">

      <div className="footer-container">

        {/* =====================================================
            FOOTER TOP
        ====================================================== */}

        <div className="footer-top">

          {/* ===================================================
              BRAND
          =================================================== */}

          <div className="footer-brand">

            <Link
              to="/"
              className="footer-logo"
            >
              {siteName}
            </Link>


            <p className="footer-description">
              {footer.description}
            </p>


            <div className="footer-socials">

              <a
                href={
                  footer.social_links
                    .instagram
                }
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                Instagram
              </a>


              <a
                href={
                  footer.social_links
                    .facebook
                }
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                Facebook
              </a>


              <a
                href={
                  footer.social_links
                    .tiktok
                }
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                TikTok
              </a>

            </div>

          </div>


          {/* ===================================================
              SHOP
          =================================================== */}

          <div className="footer-column">

            <h3>
              {footer.shop.title}
            </h3>


            {footer.shop.links.map(
              (
                item,
                index
              ) => (
                <FooterLink
                  key={`shop-${index}`}
                  label={
                    item.label
                  }
                  url={
                    item.url
                  }
                />
              )
            )}

          </div>


          {/* ===================================================
              HELP
          =================================================== */}

          <div className="footer-column">

            <h3>
              {footer.help.title}
            </h3>


            {footer.help.links.map(
              (
                item,
                index
              ) => (
                <FooterLink
                  key={`help-${index}`}
                  label={
                    item.label
                  }
                  url={
                    item.url
                  }
                />
              )
            )}

          </div>


          {/* ===================================================
              COMPANY
          =================================================== */}

          <div className="footer-column">

            <h3>
              {footer.company.title}
            </h3>


            {footer.company.links.map(
              (
                item,
                index
              ) => (
                <FooterLink
                  key={`company-${index}`}
                  label={
                    item.label
                  }
                  url={
                    item.url
                  }
                />
              )
            )}

          </div>


          {/* ===================================================
              NEWSLETTER
          =================================================== */}

          <div className="footer-newsletter">

            <h3>
              {
                footer
                  .newsletter
                  .title
              }
            </h3>


            <p>
              {
                footer
                  .newsletter
                  .description
              }
            </p>


            <form
              className="newsletter-form"
              onSubmit={
                handleNewsletterSubmit
              }
            >

              <input
                type="email"
                placeholder={
                  footer
                    .newsletter
                    .input_placeholder
                }
                aria-label={
                  footer
                    .newsletter
                    .input_placeholder
                }
                required
              />


              <button
                type="submit"
              >
                {
                  footer
                    .newsletter
                    .button_text
                }
              </button>

            </form>

          </div>

        </div>


        {/* =====================================================
            DELIVERY STRIP
        ====================================================== */}

        <div className="footer-delivery">

          {footer.delivery.items.map(
            (
              item,
              index
            ) => (
              <div
                className="footer-delivery-item"
                key={`delivery-${index}`}
              >

                <span className="footer-delivery-icon">
                  {item.icon}
                </span>

                <div>

                  <strong>
                    {item.title}
                  </strong>

                  <span>
                    {item.description}
                  </span>

                </div>

              </div>
            )
          )}

        </div>


        {/* =====================================================
            FOOTER BOTTOM
        ====================================================== */}

        <div className="footer-bottom">

          <p>
            ©{" "}
            {new Date().getFullYear()}{" "}
            {siteName}.{" "}
            {
              footer
                .bottom
                .copyright_text
            }
          </p>


          <div className="footer-legal-links">

            <FooterLink
              label={
                footer
                  .bottom
                  .privacy_label
              }
              url={
                footer
                  .bottom
                  .privacy_url
              }
            />

            <FooterLink
              label={
                footer
                  .bottom
                  .terms_label
              }
              url={
                footer
                  .bottom
                  .terms_url
              }
            />

            <FooterLink
              label={
                footer
                  .bottom
                  .contact_label
              }
              url={
                footer
                  .bottom
                  .contact_url
              }
            />

          </div>

        </div>

      </div>

    </footer>
  );
}


export default Footer;