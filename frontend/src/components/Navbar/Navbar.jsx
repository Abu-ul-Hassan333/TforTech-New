import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

import "./Navbar.css";

// ============================================================
// BACKEND
// ============================================================

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

// ============================================================
// DEFAULT HEADER SETTINGS
// ============================================================

const DEFAULT_HEADER_SETTINGS = {
  announcement_text_1:
    "Free shipping on orders over PKR 5,000",

  announcement_text_2:
    "Pakistan & Middle East",

  logo_text_main:
    "T",

  logo_text_secondary:
    "For Tech",
};

// ============================================================
// NORMALIZE HEADER SETTINGS
// ============================================================

const normalizeHeaderSettings = (
  serverSettings
) => {
  if (!serverSettings) {
    return {
      ...DEFAULT_HEADER_SETTINGS,
    };
  }

  return {
    ...DEFAULT_HEADER_SETTINGS,
    ...serverSettings,
  };
};

// ============================================================
// SEARCH HELPERS
// ============================================================

const getProductId = (product) => {
  return (
    product?.product_id ||
    product?.id ||
    product?._id ||
    null
  );
};

const getProductImage = (product) => {
  return (
    product?.image_url ||
    product?.image ||
    (Array.isArray(product?.image_urls)
      ? product.image_urls[0]
      : "") ||
    ""
  );
};

const getProductPrice = (product) => {
  const originalPrice = Number(
    product?.price || 0
  );

  const discountPrice = Number(
    product?.discount_price
  );

  if (
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < originalPrice
  ) {
    return discountPrice;
  }

  return originalPrice;
};

const formatPrice = (price) => {
  return `PKR ${Number(
    price || 0
  ).toLocaleString("en-PK")}`;
};

const stripHtml = (value) => {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getProductSearchText = (product) => {
  const specifications =
    product?.specifications || {};

  const specificationText =
    Object.values(specifications)
      .filter(Boolean)
      .join(" ");

  return stripHtml(
    [
      product?.name,
      product?.category,
      product?.description,
      product?.shortDescription,
      product?.brand,
      product?.sku,
      product?.condition,
      specificationText,
    ]
      .filter(Boolean)
      .join(" ")
  ).toLowerCase();
};

// ============================================================
// SEARCH ICON
// ============================================================

function SearchIcon() {
  return (
    <svg
      className="navbar-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M16 16L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================
// HEART ICON
// ============================================================

function HeartIcon() {
  return (
    <svg
      className="navbar-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20.8 8.7C20.8 14.2 12 19 12 19S3.2 14.2 3.2 8.7C3.2 5.9 5.1 4 7.6 4C9.2 4 10.7 4.8 12 6.3C13.3 4.8 14.8 4 16.4 4C18.9 4 20.8 5.9 20.8 8.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================
// SHOPPING CART ICON
// ============================================================

function ShoppingCartIcon() {
  return (
    <svg
      className="navbar-svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 4H5L7.2 15.2C7.4 16.2 8.2 17 9.2 17H17.5C18.4 17 19.2 16.4 19.5 15.5L21 9H6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="9.5"
        cy="20"
        r="1.3"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="17.5"
        cy="20"
        r="1.3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ============================================================
// USER ICON
// ============================================================

function UserIcon() {
  return (
    <svg
      className="login-user-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M5.5 20C6.2 16.4 8.3 14.5 12 14.5C15.7 14.5 17.8 16.4 18.5 20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================
// NAVBAR
// ============================================================

function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [userName, setUserName] =
    useState("");

  const [isAdmin, setIsAdmin] =
    useState(false);

  // ==========================================================
  // HEADER SETTINGS
  // ==========================================================

  const [
    headerSettings,
    setHeaderSettings,
  ] = useState(
    DEFAULT_HEADER_SETTINGS
  );

  // ==========================================================
  // SEARCH STATE
  // ==========================================================

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchProducts, setSearchProducts] =
    useState([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const { totalItems } =
    useCart();

  const { wishlistCount } =
    useWishlist();

  // ==========================================================
  // LOAD HEADER SETTINGS
  // ==========================================================

  const fetchHeaderSettings =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              `${API}/header-footer/public`,
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

          const loadedHeader =
            normalizeHeaderSettings(
              data?.settings
                ?.header
            );

          setHeaderSettings(
            loadedHeader
          );
        } catch (
          error
        ) {
          console.error(
            "Navbar header settings loading error:",
            error
          );

          setHeaderSettings(
            DEFAULT_HEADER_SETTINGS
          );
        }
      },
      []
    );

  useEffect(() => {
    fetchHeaderSettings();
  }, [
    fetchHeaderSettings,
  ]);

  // ==========================================================
  // AUTH STATE
  // ==========================================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem(
        "tfortech_logged_in"
      ) === "true";

    const storedUserName =
      localStorage.getItem(
        "tfortech_user_name"
      ) || "";

    const storedUserRole =
      String(
        localStorage.getItem(
          "tfortech_user_role"
        ) || ""
      )
        .toLowerCase()
        .trim();

    setIsLoggedIn(
      loggedIn
    );

    setUserName(
      storedUserName
    );

    setIsAdmin(
      loggedIn &&
        (
          storedUserRole === "admin" ||
          storedUserRole === "co_admin"
        )
    );
  }, [
    location.pathname,
  ]);

  // ==========================================================
  // ADMIN PANEL PATH
  // ==========================================================

  const storedUserRole =
    String(
      localStorage.getItem(
        "tfortech_user_role"
      ) || ""
    )
      .toLowerCase()
      .trim();

  const adminPanelPath =
    storedUserRole === "co_admin"
      ? "/admin/products"
      : "/admin";

  // ==========================================================
  // CLOSE MENU
  // ==========================================================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // ==========================================================
  // CLOSE SEARCH
  // ==========================================================

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchError("");
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
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

    setIsLoggedIn(false);
    setUserName("");
    setIsAdmin(false);

    closeMenu();
    closeSearch();

    navigate("/");
  };

  // ==========================================================
  // FETCH PRODUCTS FOR SEARCH
  // ==========================================================

  const fetchSearchProducts =
    async () => {
      try {
        setSearchLoading(
          true
        );

        setSearchError("");

        const response =
          await fetch(
            `${API}/products?page=1&limit=5000`,
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
          throw new Error(
            "Unable to load products."
          );
        }

        const data =
          await response.json();

        const receivedProducts =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.products
              )
            ? data.products
            : [];

        setSearchProducts(
          receivedProducts
        );
      } catch (
        error
      ) {
        console.error(
          "Navbar search products error:",
          error
        );

        setSearchProducts(
          []
        );

        setSearchError(
          "Unable to load products right now. Please try again."
        );
      } finally {
        setSearchLoading(
          false
        );
      }
    };

  // ==========================================================
  // OPEN SEARCH
  // ==========================================================

  const openSearch = () => {
    setMenuOpen(false);
    setSearchOpen(true);
    setSearchError("");

    fetchSearchProducts();
  };

  // ==========================================================
  // SEARCH KEYBOARD SUPPORT
  // ==========================================================

  useEffect(() => {
    if (!searchOpen) {
      document.body.style.overflow =
        "";

      return undefined;
    }

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        closeSearch();
        return;
      }

      if (
        event.key === "/" &&
        ![
          "INPUT",
          "TEXTAREA",
        ].includes(
          document.activeElement
            ?.tagName
        )
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    searchOpen,
  ]);

  // ==========================================================
  // SEARCH RESULTS
  // ==========================================================

  const getSearchResults =
    () => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      const queryWords =
        query
          .split(/\s+/)
          .filter(Boolean);

      return searchProducts
        .filter(
          (product) => {
            const searchableText =
              getProductSearchText(
                product
              );

            return queryWords.every(
              (word) =>
                searchableText.includes(
                  word
                )
            );
          }
        )
        .slice(0, 8);
    };

  const searchResults =
    getSearchResults();

  // ==========================================================
  // SEARCH RESULT CLICK
  // ==========================================================

  const handleSearchResultClick = (
    product
  ) => {
    const productId =
      getProductId(
        product
      );

    if (!productId) {
      return;
    }

    closeSearch();

    navigate(
      `/products/${productId}`
    );
  };

  // ==========================================================
  // SEARCH SUBMIT
  // ==========================================================

  const handleSearchSubmit = (
    event
  ) => {
    event.preventDefault();

    const query =
      searchQuery.trim();

    if (!query) {
      return;
    }

    if (
      searchResults.length > 0
    ) {
      handleSearchResultClick(
        searchResults[0]
      );

      return;
    }
  };

  // ==========================================================
  // SEARCH RESULT IMAGE
  // ==========================================================

  const renderSearchImage = (
    product
  ) => {
    const image =
      getProductImage(
        product
      );

    if (!image) {
      return (
        <div className="navbar-search-result-placeholder">
          <span>
            💻
          </span>
        </div>
      );
    }

    const finalImageUrl =
      image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      )
        ? image
        : `${BACKEND_URL}${
            image.startsWith(
              "/"
            )
              ? ""
              : "/"
          }${image}`;

    return (
      <img
        src={
          finalImageUrl
        }
        alt={
          product?.name ||
          "Product"
        }
        className="navbar-search-result-image"
        onError={(
          event
        ) => {
          event.currentTarget.style.display =
            "none";
        }}
      />
    );
  };

  // ==========================================================
  // CURRENT PAGE DETECTION
  // ==========================================================

  const isPathActive = (
    path
  ) => {
    const currentPath =
      location.pathname;

    if (path === "/") {
      return (
        currentPath === "/"
      );
    }

    return (
      currentPath === path ||
      currentPath.startsWith(
        `${path}/`
      )
    );
  };

  const isProductsActive =
    () => {
      return isPathActive(
        "/products"
      );
    };

  const isBloggingActive =
    () => {
      return isPathActive(
        "/blogging"
      );
    };

  const isCategoriesActive =
    () => {
      return isPathActive(
        "/categories"
      );
    };

  const isAboutActive =
    () => {
      return isPathActive(
        "/about"
      );
    };

  const isContactActive =
    () => {
      return isPathActive(
        "/contact"
      );
    };

  const isReviewsActive =
    () => {
      return isPathActive(
        "/reviews"
      );
    };

  // ==========================================================
  // ACTIVE NAV STYLE
  // ==========================================================

  const getNavItemStyle = (
    active
  ) => {
    if (!active) {
      return undefined;
    }

    return {
      color:
        "var(--gojuniors-accent-color, #d69e78)",
      fontWeight: 700,
    };
  };

  // ==========================================================
  // SEARCH UI INLINE STYLES
  // ==========================================================

  const searchOverlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    background:
      "rgba(15, 23, 42, 0.58)",
    backdropFilter:
      "blur(7px)",
    WebkitBackdropFilter:
      "blur(7px)",
    padding:
      "clamp(18px, 4vw, 50px)",
    display: "flex",
    justifyContent:
      "center",
    alignItems:
      "flex-start",
    overflowY: "auto",
  };

  const searchPanelStyle = {
    width: "100%",
    maxWidth: "850px",
    marginTop:
      "clamp(20px, 6vh, 55px)",
    background: "#ffffff",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow:
      "0 30px 80px rgba(15, 23, 42, 0.28)",
    border:
      "1px solid rgba(255,255,255,0.75)",
  };

  const searchHeaderStyle = {
    display: "flex",
    alignItems:
      "flex-start",
    justifyContent:
      "space-between",
    gap: "20px",
    padding:
      "24px 24px 18px",
    borderBottom:
      "1px solid #eef1f5",
  };

  const searchHeaderTitleStyle = {
    margin: 0,
    fontSize:
      "clamp(22px, 3vw, 30px)",
    lineHeight: 1.2,
    color: "#111827",
    fontWeight: 800,
  };

  const searchHeaderTextStyle = {
    margin:
      "7px 0 0",
    color: "#6b7280",
    fontSize:
      "13px",
    lineHeight: 1.6,
  };

  const searchCloseStyle = {
    width: "40px",
    height: "40px",
    flex:
      "0 0 40px",
    border:
      "1px solid #e5e7eb",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#374151",
    fontSize: "25px",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
  };

  const searchFormStyle = {
    display: "flex",
    gap: "10px",
    padding:
      "18px 24px",
    background: "#f8fafc",
    borderBottom:
      "1px solid #eef1f5",
  };

  const searchInputContainerStyle = {
    flex: 1,
    minWidth: 0,
    height: "52px",
    display: "flex",
    alignItems:
      "center",
    gap: "10px",
    padding:
      "0 15px",
    background: "#ffffff",
    border:
      "1px solid #dfe5ec",
    borderRadius:
      "12px",
  };

  const searchInputStyle = {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background:
      "transparent",
    color: "#111827",
    fontSize: "14px",
  };

  const searchButtonStyle = {
    height: "52px",
    padding:
      "0 22px",
    border: "none",
    borderRadius:
      "12px",
    background: "#3b82f6",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    cursor:
      searchQuery.trim()
        ? "pointer"
        : "not-allowed",
    opacity:
      searchQuery.trim()
        ? 1
        : 0.55,
    whiteSpace:
      "nowrap",
  };

  const searchContentStyle = {
    minHeight: "300px",
    maxHeight:
      "min(62vh, 620px)",
    overflowY: "auto",
  };

  const searchStateStyle = {
    minHeight: "300px",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    flexDirection:
      "column",
    textAlign:
      "center",
    padding:
      "35px 25px",
  };

  const stateIconStyle = {
    width: "58px",
    height: "58px",
    borderRadius:
      "18px",
    background: "#f3f6fb",
    color: "#3b82f6",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    fontSize:
      "25px",
    fontWeight: 800,
    marginBottom:
      "14px",
  };

  return (
    <>
      {/* =====================================================
          ANNOUNCEMENT BAR
      ====================================================== */}

      <div className="announcement-bar">

        <span>
          {
            headerSettings
              .announcement_text_1
          }
        </span>

        <span className="announcement-divider">
          ·
        </span>

        <span>
          {
            headerSettings
              .announcement_text_2
          }
        </span>

      </div>

      {/* =====================================================
          MAIN NAVBAR
      ====================================================== */}

      <header className="navbar">

        <div className="navbar-container">

          {/* =================================================
              LOGO
          ================================================== */}

          <Link
            to="/"
            className="navbar-logo"
            onClick={
              closeMenu
            }
          >
            {
              headerSettings
                .logo_text_main
            }

            <span>
              {
                headerSettings
                  .logo_text_secondary
              }
            </span>
          </Link>

          {/* =================================================
              MAIN NAVIGATION
          ================================================== */}

          <nav
            className={`navbar-menu ${
              menuOpen
                ? "active"
                : ""
            }`}
          >

            {/* HOME */}

            <Link
              to="/"
              onClick={
                closeMenu
              }
              style={getNavItemStyle(
                location.pathname ===
                  "/"
              )}
              aria-current={
                location.pathname ===
                "/"
                  ? "page"
                  : undefined
              }
            >
              Home
            </Link>

            {/* PRODUCTS */}

            <Link
              to="/products"
              onClick={
                closeMenu
              }
              style={getNavItemStyle(
                isProductsActive()
              )}
              aria-current={
                isProductsActive()
                  ? "page"
                  : undefined
              }
            >
              Products
            </Link>

            {/* BLOGGING */}

            <Link
              to="/blogging"
              onClick={
                closeMenu
              }
              style={getNavItemStyle(
                isBloggingActive()
              )}
              aria-current={
                isBloggingActive()
                  ? "page"
                  : undefined
              }
            >
              Blogging
            </Link>

            {/* ===============================================
                CATEGORIES
            ================================================ */}

            <div className="navbar-category-dropdown">

              <Link
                to="/categories"
                className="navbar-category-link"
                onClick={
                  closeMenu
                }
                style={getNavItemStyle(
                  isCategoriesActive()
                )}
                aria-current={
                  isCategoriesActive()
                    ? "page"
                    : undefined
                }
              >

                <span>
                  Categories
                </span>

                <span className="category-arrow">
                  ⌄
                </span>

              </Link>

              <div className="navbar-category-menu">

                <Link
                  to="/categories/hp"
                  onClick={
                    closeMenu
                  }
                >
                  HP
                </Link>

                <Link
                  to="/categories/dell"
                  onClick={
                    closeMenu
                  }
                >
                  Dell
                </Link>

                <Link
                  to="/categories/lenovo"
                  onClick={
                    closeMenu
                  }
                >
                  Lenovo
                </Link>

                <Link
                  to="/categories/macbook"
                  onClick={
                    closeMenu
                  }
                >
                  MacBook
                </Link>

              </div>

            </div>

            {/* ABOUT */}

            <Link
              to="/about"
              onClick={
                closeMenu
              }
              style={getNavItemStyle(
                isAboutActive()
              )}
              aria-current={
                isAboutActive()
                  ? "page"
                  : undefined
              }
            >
              About
            </Link>

            {/* CONTACT */}

            <Link
              to="/contact"
              onClick={
                closeMenu
              }
              style={getNavItemStyle(
                isContactActive()
              )}
              aria-current={
                isContactActive()
                  ? "page"
                  : undefined
              }
            >
              Contact
            </Link>

            {/* ===============================================
                CUSTOMER REVIEWS
            ================================================ */}

            <Link
              to="/reviews"
              onClick={
                closeMenu
              }
              style={getNavItemStyle(
                isReviewsActive()
              )}
              aria-current={
                isReviewsActive()
                  ? "page"
                  : undefined
              }
            >
              Reviews
            </Link>

            {/* ===============================================
                MOBILE SEARCH
            ================================================ */}

            <button
              type="button"
              className="navbar-mobile-search-button"
              onClick={
                openSearch
              }
              style={{
                display: "none",
              }}
            >
              <SearchIcon />

              <span>
                Search Products
              </span>
            </button>

            {/* ===============================================
                MOBILE ADMIN
            ================================================ */}

            {isAdmin && (
              <Link
                to={
                  adminPanelPath
                }
                className="navbar-mobile-admin"
                onClick={
                  closeMenu
                }
              >
                Admin Panel
              </Link>
            )}

            {/* ===============================================
                MOBILE LOGOUT
            ================================================ */}

            {isLoggedIn && (
              <button
                type="button"
                className="navbar-mobile-logout"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>
            )}

          </nav>

          {/* =================================================
              RIGHT ACTIONS

              SEARCH
              WISHLIST
              CART
              USER / ADMIN
          ================================================== */}

          <div className="navbar-actions">

            {/* SEARCH */}

            <button
              type="button"
              className="navbar-icon-button navbar-search-button"
              aria-label="Search"
              title="Search"
              onClick={
                openSearch
              }
            >
              <SearchIcon />
            </button>

            {/* WISHLIST */}

            <Link
              to="/wishlist"
              className="navbar-icon-button navbar-wishlist-button"
              aria-label={`Wishlist, ${wishlistCount} items`}
              title="Wishlist"
              onClick={
                closeMenu
              }
            >
              <HeartIcon />

              <span className="navbar-wishlist-count">
                {wishlistCount}
              </span>
            </Link>

            {/* CART */}

            <Link
              to="/cart"
              className="navbar-icon-button navbar-cart-button"
              aria-label={`Shopping Cart, ${totalItems} items`}
              title="Shopping Cart"
              onClick={
                closeMenu
              }
            >
              <ShoppingCartIcon />

              <span className="navbar-cart-count">
                {totalItems}
              </span>
            </Link>

            {/* =================================================
                AUTHENTICATED USER
            ================================================== */}

            {isLoggedIn ? (
              <div className="navbar-user-area">

                {/* ADMIN PANEL */}

                {isAdmin && (
                  <Link
                    to={
                      adminPanelPath
                    }
                    className="navbar-admin-button"
                    title="Open Admin Panel"
                    onClick={
                      closeMenu
                    }
                  >
                    Admin Panel
                  </Link>
                )}

                {/* ACCOUNT */}

                <Link
                  to="/account"
                  className="navbar-user-button"
                  title={
                    userName
                      ? `Open account for ${userName}`
                      : "Open Account"
                  }
                  onClick={
                    closeMenu
                  }
                >
                  <UserIcon />

                  <span className="navbar-user-name">
                    {
                      userName ||
                      "Account"
                    }
                  </span>
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  className="navbar-logout-button"
                  onClick={
                    handleLogout
                  }
                >
                  Logout
                </button>

              </div>
            ) : (
              <Link
                to="/login"
                className="navbar-login-button"
                onClick={
                  closeMenu
                }
              >
                <UserIcon />

                <span>
                  Login
                </span>
              </Link>
            )}

          </div>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================== */}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMenuOpen(
                (previous) =>
                  !previous
              )
            }
            aria-label="Toggle navigation menu"
            aria-expanded={
              menuOpen
            }
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

      </header>

      {/* =====================================================
          PROFESSIONAL SEARCH OVERLAY
      ===================================================== */}

      {searchOpen && (
        <div
          style={
            searchOverlayStyle
          }
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeSearch();
            }
          }}
        >

          <div
            style={
              searchPanelStyle
            }
            onMouseDown={(
              event
            ) => {
              event.stopPropagation();
            }}
          >

            {/* =================================================
                SEARCH HEADER
            ================================================== */}

            <div
              style={
                searchHeaderStyle
              }
            >

              <div>

                <div
                  style={{
                    fontSize:
                      "10px",
                    fontWeight: 800,
                    letterSpacing:
                      "0.12em",
                    color:
                      "#3b82f6",
                    marginBottom:
                      "7px",
                  }}
                >
                  TFORTECH SEARCH
                </div>

                <h2
                  style={
                    searchHeaderTitleStyle
                  }
                >
                  Find the right product
                </h2>

                <p
                  style={
                    searchHeaderTextStyle
                  }
                >
                  Search laptops,
                  accessories and
                  other products from
                  our store.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeSearch
                }
                aria-label="Close search"
                title="Close search"
                style={
                  searchCloseStyle
                }
                onMouseEnter={(
                  event
                ) => {
                  event.currentTarget.style.background =
                    "#f3f4f6";
                }}
                onMouseLeave={(
                  event
                ) => {
                  event.currentTarget.style.background =
                    "#ffffff";
                }}
              >
                ×
              </button>

            </div>

            {/* =================================================
                SEARCH FORM
            ================================================== */}

            <form
              onSubmit={
                handleSearchSubmit
              }
              style={
                searchFormStyle
              }
            >

              <div
                style={
                  searchInputContainerStyle
                }
              >

                <div
                  style={{
                    width:
                      "21px",
                    height:
                      "21px",
                    flex:
                      "0 0 21px",
                    color:
                      "#6b7280",
                  }}
                >
                  <SearchIcon />
                </div>

                <input
                  type="search"
                  value={
                    searchQuery
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search product name, category, brand, SKU..."
                  autoFocus
                  aria-label="Search products"
                  style={
                    searchInputStyle
                  }
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery(
                        ""
                      )
                    }
                    aria-label="Clear search"
                    title="Clear search"
                    style={{
                      width:
                        "28px",
                      height:
                        "28px",
                      flex:
                        "0 0 28px",
                      border:
                        "none",
                      borderRadius:
                        "50%",
                      background:
                        "#eef2f7",
                      color:
                        "#5f6b7a",
                      cursor:
                        "pointer",
                      fontSize:
                        "18px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    ×
                  </button>
                )}

              </div>

              <button
                type="submit"
                disabled={
                  !searchQuery.trim()
                }
                style={
                  searchButtonStyle
                }
              >
                Search
              </button>

            </form>

            {/* =================================================
                SEARCH CONTENT
            ================================================== */}

            <div
              style={
                searchContentStyle
              }
            >

              {/* LOADING */}

              {searchLoading && (
                <div
                  style={
                    searchStateStyle
                  }
                >

                  <div
                    style={{
                      width:
                        "38px",
                      height:
                        "38px",
                      border:
                        "3px solid #e5e7eb",
                      borderTopColor:
                        "#3b82f6",
                      borderRadius:
                        "50%",
                      animation:
                        "tfortechSearchSpin 0.8s linear infinite",
                      marginBottom:
                        "16px",
                    }}
                  ></div>

                  <h3
                    style={{
                      margin:
                        "0 0 7px",
                      color:
                        "#111827",
                      fontSize:
                        "17px",
                    }}
                  >
                    Searching products...
                  </h3>

                  <p
                    style={{
                      margin:
                        0,
                      color:
                        "#6b7280",
                      fontSize:
                        "13px",
                    }}
                  >
                    Loading the latest
                    products from
                    your store.
                  </p>

                </div>
              )}

              {/* ERROR */}

              {!searchLoading &&
                searchError && (
                  <div
                    style={
                      searchStateStyle
                    }
                  >

                    <div
                      style={{
                        ...stateIconStyle,
                        background:
                          "#fff1f2",
                        color:
                          "#dc2626",
                      }}
                    >
                      !
                    </div>

                    <h3
                      style={{
                        margin:
                          "0 0 7px",
                        color:
                          "#111827",
                        fontSize:
                          "18px",
                      }}
                    >
                      Search unavailable
                    </h3>

                    <p
                      style={{
                        margin:
                          "0 0 18px",
                        maxWidth:
                          "440px",
                        color:
                          "#6b7280",
                        fontSize:
                          "13px",
                        lineHeight:
                          1.6,
                      }}
                    >
                      {searchError}
                    </p>

                    <button
                      type="button"
                      onClick={
                        fetchSearchProducts
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "#3b82f6",
                        color:
                          "#ffffff",
                        borderRadius:
                          "10px",
                        padding:
                          "10px 18px",
                        fontSize:
                          "13px",
                        fontWeight:
                          700,
                        cursor:
                          "pointer",
                      }}
                    >
                      Try Again
                    </button>

                  </div>
                )}

              {/* EMPTY SEARCH */}

              {!searchLoading &&
                !searchError &&
                !searchQuery.trim() && (
                  <div
                    style={
                      searchStateStyle
                    }
                  >

                    <div
                      style={
                        stateIconStyle
                      }
                    >
                      <SearchIcon />
                    </div>

                    <h3
                      style={{
                        margin:
                          "0 0 7px",
                        color:
                          "#111827",
                        fontSize:
                          "18px",
                      }}
                    >
                      Search our store
                    </h3>

                    <p
                      style={{
                        margin:
                          "0 0 20px",
                        color:
                          "#6b7280",
                        fontSize:
                          "13px",
                      }}
                    >
                      Start typing to find
                      your desired
                      product.
                    </p>

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        flexWrap:
                          "wrap",
                        gap:
                          "8px",
                        fontSize:
                          "12px",
                      }}
                    >

                      <span
                        style={{
                          color:
                            "#6b7280",
                          fontWeight:
                            600,
                        }}
                      >
                        Popular searches:
                      </span>

                      {[
                        "Dell",
                        "HP",
                        "Lenovo",
                        "Gaming",
                        "MacBook",
                      ].map(
                        (
                          term
                        ) => (
                          <button
                            type="button"
                            key={
                              term
                            }
                            onClick={() =>
                              setSearchQuery(
                                term
                              )
                            }
                            style={{
                              border:
                                "1px solid #dce3ec",
                              background:
                                "#ffffff",
                              color:
                                "#334155",
                              padding:
                                "7px 11px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "12px",
                              fontWeight:
                                600,
                              cursor:
                                "pointer",
                            }}
                          >
                            {
                              term
                            }
                          </button>
                        )
                      )}

                    </div>

                  </div>
                )}

              {/* SEARCH RESULTS */}

              {!searchLoading &&
                !searchError &&
                searchQuery.trim() &&
                searchResults.length >
                  0 && (
                  <div>

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap:
                          "12px",
                        padding:
                          "16px 24px 12px",
                        borderBottom:
                          "1px solid #eef1f5",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "8px",
                        }}
                      >

                        <span
                          style={{
                            color:
                              "#111827",
                            fontSize:
                              "13px",
                            fontWeight:
                              800,
                          }}
                        >
                          Search Results
                        </span>

                        <span
                          style={{
                            minWidth:
                              "22px",
                            height:
                              "22px",
                            padding:
                              "0 6px",
                            borderRadius:
                              "999px",
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            background:
                              "#eff6ff",
                            color:
                              "#2563eb",
                            fontSize:
                              "11px",
                            fontWeight:
                              800,
                          }}
                        >
                          {
                            searchResults.length
                          }
                        </span>

                      </div>

                      <span
                        style={{
                          color:
                            "#8a94a3",
                          fontSize:
                            "11px",
                        }}
                      >
                        Matching products
                      </span>

                    </div>

                    <div
                      style={{
                        padding:
                          "8px 14px 14px",
                      }}
                    >

                      {searchResults.map(
                        (
                          product
                        ) => {
                          const productId =
                            getProductId(
                              product
                            );

                          const description =
                            stripHtml(
                              product?.shortDescription ||
                                product?.description ||
                                ""
                            );

                          return (
                            <button
                              type="button"
                              key={
                                productId ||
                                product?.name
                              }
                              onClick={() =>
                                handleSearchResultClick(
                                  product
                                )
                              }
                              style={{
                                width:
                                  "100%",
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "62px minmax(0, 1fr) auto",
                                gap:
                                  "14px",
                                alignItems:
                                  "center",
                                padding:
                                  "11px 10px",
                                marginBottom:
                                  "4px",
                                background:
                                  "#ffffff",
                                border:
                                  "1px solid transparent",
                                borderRadius:
                                  "14px",
                                textAlign:
                                  "left",
                                cursor:
                                  "pointer",
                              }}
                              onMouseEnter={(
                                event
                              ) => {
                                event.currentTarget.style.background =
                                  "#f8fafc";

                                event.currentTarget.style.borderColor =
                                  "#e2e8f0";
                              }}
                              onMouseLeave={(
                                event
                              ) => {
                                event.currentTarget.style.background =
                                  "#ffffff";

                                event.currentTarget.style.borderColor =
                                  "transparent";
                              }}
                            >

                              <div
                                style={{
                                  width:
                                    "62px",
                                  height:
                                    "62px",
                                  borderRadius:
                                    "12px",
                                  overflow:
                                    "hidden",
                                  background:
                                    "#f3f6fa",
                                  border:
                                    "1px solid #e6eaf0",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                }}
                              >
                                {
                                  renderSearchImage(
                                    product
                                  )
                                }
                              </div>

                              <div
                                style={{
                                  minWidth:
                                    0,
                                  display:
                                    "flex",
                                  flexDirection:
                                    "column",
                                  gap:
                                    "4px",
                                }}
                              >

                                <span
                                  style={{
                                    color:
                                      "#3b82f6",
                                    fontSize:
                                      "9px",
                                    fontWeight:
                                      800,
                                    letterSpacing:
                                      "0.08em",
                                    textTransform:
                                      "uppercase",
                                  }}
                                >
                                  {
                                    product?.category ||
                                    "Product"
                                  }
                                </span>

                                <strong
                                  style={{
                                    color:
                                      "#111827",
                                    fontSize:
                                      "14px",
                                    lineHeight:
                                      1.3,
                                    overflow:
                                      "hidden",
                                    textOverflow:
                                      "ellipsis",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {
                                    product?.name ||
                                    "Unnamed Product"
                                  }
                                </strong>

                                {description && (
                                  <span
                                    style={{
                                      color:
                                        "#7a8492",
                                      fontSize:
                                        "11px",
                                      lineHeight:
                                        1.45,
                                      display:
                                        "-webkit-box",
                                      WebkitLineClamp:
                                        2,
                                      WebkitBoxOrient:
                                        "vertical",
                                      overflow:
                                        "hidden",
                                    }}
                                  >
                                    {
                                      description.slice(
                                        0,
                                        115
                                      )
                                    }
                                    {description.length >
                                    115
                                      ? "..."
                                      : ""}
                                  </span>
                                )}

                              </div>

                              <div
                                style={{
                                  display:
                                    "flex",
                                  flexDirection:
                                    "column",
                                  alignItems:
                                    "flex-end",
                                  gap:
                                    "5px",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >

                                <strong
                                  style={{
                                    color:
                                      "#111827",
                                    fontSize:
                                      "13px",
                                  }}
                                >
                                  {
                                    formatPrice(
                                      getProductPrice(
                                        product
                                      )
                                    )
                                  }
                                </strong>

                                <span
                                  style={{
                                    color:
                                      "#3b82f6",
                                    fontSize:
                                      "10px",
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  View →
                                </span>

                              </div>

                            </button>
                          );
                        }
                      )}

                    </div>

                    <div
                      style={{
                        padding:
                          "13px 24px 16px",
                        borderTop:
                          "1px solid #eef1f5",
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap:
                          "12px",
                        flexWrap:
                          "wrap",
                      }}
                    >

                      <span
                        style={{
                          color:
                            "#8992a1",
                          fontSize:
                            "11px",
                        }}
                      >
                        Click a product
                        to view its
                        details.
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const firstResult =
                            searchResults[0];

                          if (
                            firstResult
                          ) {
                            handleSearchResultClick(
                              firstResult
                            );
                          }
                        }}
                        style={{
                          border:
                            "none",
                          background:
                            "#eef5ff",
                          color:
                            "#2563eb",
                          padding:
                            "8px 12px",
                          borderRadius:
                            "9px",
                          fontSize:
                            "11px",
                          fontWeight:
                            700,
                          cursor:
                            "pointer",
                        }}
                      >
                        Open First Result →
                      </button>

                    </div>

                  </div>
                )}

              {/* NO RESULTS */}

              {!searchLoading &&
                !searchError &&
                searchQuery.trim() &&
                searchResults.length ===
                  0 && (
                  <div
                    style={
                      searchStateStyle
                    }
                  >

                    <div
                      style={{
                        ...stateIconStyle,
                        background:
                          "#f8fafc",
                        color:
                          "#64748b",
                      }}
                    >
                      ⌕
                    </div>

                    <h3
                      style={{
                        margin:
                          "0 0 7px",
                        color:
                          "#111827",
                        fontSize:
                          "19px",
                      }}
                    >
                      No Results Found
                    </h3>

                    <p
                      style={{
                        margin:
                          0,
                        maxWidth:
                          "430px",
                        color:
                          "#6b7280",
                        fontSize:
                          "13px",
                        lineHeight:
                          1.65,
                      }}
                    >
                      We couldn&apos;t find
                      any product matching
                      <strong
                        style={{
                          color:
                            "#374151",
                        }}
                      >
                        {" "}
                        &quot;
                        {
                          searchQuery.trim()
                        }
                        &quot;
                      </strong>
                      .
                    </p>

                    <div
                      style={{
                        marginTop:
                          "18px",
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        justifyContent:
                          "center",
                        gap:
                          "7px",
                      }}
                    >

                      <span
                        style={{
                          color:
                            "#8a94a3",
                          fontSize:
                            "11px",
                        }}
                      >
                        Try:
                      </span>

                      <span
                        style={{
                          padding:
                            "6px 9px",
                          background:
                            "#f3f6fb",
                          borderRadius:
                            "999px",
                          color:
                            "#667085",
                          fontSize:
                            "11px",
                        }}
                      >
                        fewer words
                      </span>

                      <span
                        style={{
                          padding:
                            "6px 9px",
                          background:
                            "#f3f6fb",
                          borderRadius:
                            "999px",
                          color:
                            "#667085",
                          fontSize:
                            "11px",
                        }}
                      >
                        another category
                      </span>

                      <span
                        style={{
                          padding:
                            "6px 9px",
                          background:
                            "#f3f6fb",
                          borderRadius:
                            "999px",
                          color:
                            "#667085",
                          fontSize:
                            "11px",
                        }}
                      >
                        product brand
                      </span>

                    </div>

                  </div>
                )}

            </div>

            {/* =================================================
                SEARCH FOOTER
            ================================================== */}

            <div
              style={{
                padding:
                  "11px 24px",
                borderTop:
                  "1px solid #eef1f5",
                background:
                  "#fbfcfe",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap:
                  "12px",
                flexWrap:
                  "wrap",
              }}
            >

              <span
                style={{
                  color:
                    "#8b95a5",
                  fontSize:
                    "10px",
                }}
              >
                Search is connected
                to your live store
                products.
              </span>

              <span
                style={{
                  color:
                    "#8b95a5",
                  fontSize:
                    "10px",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap:
                    "5px",
                }}
              >
                Press

                <kbd
                  style={{
                    padding:
                      "2px 6px",
                    border:
                      "1px solid #d8dee8",
                    borderBottomWidth:
                      "2px",
                    borderRadius:
                      "5px",
                    background:
                      "#ffffff",
                    color:
                      "#5f6b7a",
                    fontSize:
                      "9px",
                    fontWeight:
                      700,
                  }}
                >
                  ESC
                </kbd>

                to close
              </span>

            </div>

          </div>

          {/* =================================================
              SEARCH SPINNER ANIMATION
          ================================================== */}

          <style>
            {`
              @keyframes tfortechSearchSpin {
                from {
                  transform: rotate(0deg);
                }

                to {
                  transform: rotate(360deg);
                }
              }

              @media (max-width: 760px) {
                .navbar-mobile-search-button {
                  display: flex !important;
                  width: 100%;
                  padding: 12px 0;
                  align-items: center;
                  gap: 10px;
                  background: transparent;
                  border: none;
                  color: #222222;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                  text-align: left;
                }

                body.gojuniors-theme-active
                .navbar-mobile-search-button {
                  color: var(
                    --gojuniors-header-text-color,
                    #222222
                  );
                }
              }

              @media (max-width: 560px) {
                .navbar-search-result-placeholder,
                .navbar-search-result-image {
                  width: 62px !important;
                  height: 62px !important;
                }
              }
            `}
          </style>

        </div>
      )}
    </>
  );
}

export default Navbar;