import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import "./Products.css";

// ============================================================
// BACKEND
// ============================================================

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

// ============================================================
// CATEGORY LIST
// ============================================================

const categories = [
  "All Categories",
  "Laptops",
  "Gaming Laptops",
  "Business Laptops",
  "MacBooks",
  "Laptop Accessories",
  "Keyboards",
  "Mice",
  "Headphones",
  "Laptop Bags",
  "Chargers & Adapters",
  "Storage",
  "RAM",
];

// ============================================================
// HELPERS
// ============================================================

const formatPrice = (price) => {
  return `PKR ${Number(price || 0).toLocaleString("en-PK")}`;
};

const getDiscount = (price, oldPrice) => {
  const currentPrice = Number(price || 0);
  const previousPrice = Number(oldPrice || 0);

  if (
    !previousPrice ||
    previousPrice <= currentPrice
  ) {
    return null;
  }

  return Math.round(
    ((previousPrice - currentPrice) / previousPrice) * 100
  );
};

const getProductId = (product) => {
  return (
    product?.product_id ||
    product?.id ||
    product?._id ||
    null
  );
};

// ============================================================
// PRODUCT IMAGE
// ============================================================

function ProductImage({ product }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [product?.image_url, product?.image_urls]);

  const imageUrl =
    product?.image_url ||
    (Array.isArray(product?.image_urls)
      ? product.image_urls[0]
      : "");

  if (imageUrl && !imageError) {
    const finalImageUrl =
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
        ? imageUrl
        : `${BACKEND_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;

    return (
      <img
        src={finalImageUrl}
        alt={product?.name || "Product"}
        className="product-card-image"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className="product-image-placeholder">
      <span className="placeholder-laptop-icon">💻</span>
      <span className="placeholder-text">
        Product Image
      </span>
    </div>
  );
}

// ============================================================
// STAR RATING
// ============================================================

function StarRating({ rating, reviews }) {
  return (
    <div
      className="product-rating"
      aria-label={`${rating || 0} out of 5 stars`}
    >
      <span className="stars">★★★★★</span>

      <span className="rating-number">
        {Number(rating || 0).toFixed(1)}
      </span>

      <span className="review-count">
        ({Number(reviews || 0)})
      </span>
    </div>
  );
}

// ============================================================
// PRODUCTS PAGE
// ============================================================

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ----------------------------------------------------------
  // CART CONTEXT
  // ----------------------------------------------------------

  const {
    addToCart,
    totalItems,
  } = useCart();

  // ----------------------------------------------------------
  // WISHLIST CONTEXT
  // ----------------------------------------------------------

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  // ----------------------------------------------------------
  // URL CATEGORY
  // ----------------------------------------------------------

  const initialCategory =
    searchParams.get("category") ||
    "All Categories";

  // ----------------------------------------------------------
  // MONGODB PRODUCTS
  // ----------------------------------------------------------

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ----------------------------------------------------------
  // FILTER STATE
  // ----------------------------------------------------------

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);

  const [priceFilter, setPriceFilter] =
    useState("all");

  const [availability, setAvailability] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("featured");

  const [showFilters, setShowFilters] =
    useState(false);

  // ==========================================================
  // LOAD PRODUCTS FROM MONGODB
  // ==========================================================

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await axios.get(
          `${API}/products/?page=1&limit=5000`
        );

        if (!isMounted) {
          return;
        }

        const data = response?.data;

        const databaseProducts = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        /*
          IMPORTANT:
          No demo/static products are added here.

          Only products returned by MongoDB are placed into
          the Products page.
        */
        setProducts(databaseProducts);
      } catch (error) {
        console.error(
          "Error fetching products from MongoDB:",
          error
        );

        if (!isMounted) {
          return;
        }

        setProducts([]);

        setLoadError(
          "Unable to load products from the database."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // ----------------------------------------------------------
  // CATEGORY CHANGE
  // ----------------------------------------------------------

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    const nextParams =
      new URLSearchParams(searchParams);

    if (category === "All Categories") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", category);
    }

    setSearchParams(nextParams);
  };

  // ----------------------------------------------------------
  // WISHLIST
  // ----------------------------------------------------------

  const handleWishlistToggle = (product) => {
    if (!product) {
      return;
    }

    toggleWishlist(product);
  };

  // ----------------------------------------------------------
  // ADD TO CART
  // ----------------------------------------------------------

  const handleAddToCart = (product) => {
    if (!product) {
      return;
    }

    const stock = Number(product.stock || 0);

    if (stock <= 0 || product.is_sold_out) {
      return;
    }

    addToCart(product, 1);
  };

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (searchTerm.trim()) {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      result = result.filter((product) => {
        const name =
          String(product?.name || "")
            .toLowerCase();

        const category =
          String(product?.category || "")
            .toLowerCase();

        const description =
          String(product?.description || "")
            .replace(/<[^>]*>/g, " ")
            .toLowerCase();

        const brand =
          String(product?.brand || "")
            .toLowerCase();

        const sku =
          String(product?.sku || "")
            .toLowerCase();

        return (
          name.includes(search) ||
          category.includes(search) ||
          description.includes(search) ||
          brand.includes(search) ||
          sku.includes(search)
        );
      });
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (selectedCategory !== "All Categories") {
      result = result.filter((product) => {
        return (
          String(product?.category || "")
            .toLowerCase() ===
          String(selectedCategory)
            .toLowerCase()
        );
      });
    }

    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    const getCurrentPrice = (product) => {
      const discountPrice =
        Number(product?.discount_price);

      const originalPrice =
        Number(product?.price || 0);

      if (
        Number.isFinite(discountPrice) &&
        discountPrice > 0 &&
        discountPrice < originalPrice
      ) {
        return discountPrice;
      }

      return originalPrice;
    };

    if (priceFilter === "under-50000") {
      result = result.filter(
        (product) =>
          getCurrentPrice(product) < 50000
      );
    }

    if (priceFilter === "50000-100000") {
      result = result.filter(
        (product) => {
          const price =
            getCurrentPrice(product);

          return (
            price >= 50000 &&
            price <= 100000
          );
        }
      );
    }

    if (priceFilter === "100000-200000") {
      result = result.filter(
        (product) => {
          const price =
            getCurrentPrice(product);

          return (
            price > 100000 &&
            price <= 200000
          );
        }
      );
    }

    if (priceFilter === "over-200000") {
      result = result.filter(
        (product) =>
          getCurrentPrice(product) > 200000
      );
    }

    // --------------------------------------------------------
    // AVAILABILITY
    // --------------------------------------------------------

    if (availability === "in-stock") {
      result = result.filter(
        (product) =>
          Number(product?.stock || 0) > 0 &&
          !product?.is_sold_out
      );
    }

    if (availability === "out-of-stock") {
      result = result.filter(
        (product) =>
          Number(product?.stock || 0) <= 0 ||
          product?.is_sold_out
      );
    }

    // --------------------------------------------------------
    // SORTING
    // --------------------------------------------------------

    const getCurrentPriceForSort = (product) => {
      const discountPrice =
        Number(product?.discount_price);

      const originalPrice =
        Number(product?.price || 0);

      if (
        Number.isFinite(discountPrice) &&
        discountPrice > 0 &&
        discountPrice < originalPrice
      ) {
        return discountPrice;
      }

      return originalPrice;
    };

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          getCurrentPriceForSort(a) -
          getCurrentPriceForSort(b)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          getCurrentPriceForSort(b) -
          getCurrentPriceForSort(a)
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          Number(b?.rating || 0) -
          Number(a?.rating || 0)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        String(a?.name || "").localeCompare(
          String(b?.name || "")
        )
      );
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    priceFilter,
    availability,
    sortBy,
  ]);

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setPriceFilter("all");
    setAvailability("all");
    setSortBy("featured");
    setSearchParams({});
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="products-page">
      <Navbar />

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <section className="products-hero">
        <div className="products-hero-content">
          <span className="products-hero-label">
            LAPTOPS &amp; ACCESSORIES
          </span>

          <h1>Find the Right Technology</h1>

          <p>
            Explore laptops, gaming machines and accessories
            selected for work, study, gaming and everyday use.
          </p>

          <div className="products-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Products</span>
          </div>
        </div>
      </section>

      {/* ======================================================
          PRODUCTS CONTENT
      ====================================================== */}

      <section className="products-main">
        <div className="products-container">

          {/* --------------------------------------------------
              TOP TOOLBAR
          -------------------------------------------------- */}

          <div className="products-toolbar">

            <div className="products-result-count">
              <strong>
                {loading
                  ? "..."
                  : filteredProducts.length}
              </strong>

              <span>
                {filteredProducts.length === 1
                  ? " product"
                  : " products"}
              </span>
            </div>

            <button
              type="button"
              className="mobile-filter-button"
              onClick={() =>
                setShowFilters(!showFilters)
              }
            >
              ☰ Filters
            </button>

            <div className="products-sort">
              <label htmlFor="sort-products">
                Sort by
              </label>

              <select
                id="sort-products"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="featured">
                  Featured
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="name">
                  Name: A-Z
                </option>
              </select>
            </div>
          </div>

          {/* --------------------------------------------------
              PRODUCTS LAYOUT
          -------------------------------------------------- */}

          <div className="products-layout">

            {/* =================================================
                SIDEBAR FILTERS
            ================================================= */}

            <aside
              className={`products-sidebar ${
                showFilters
                  ? "mobile-visible"
                  : ""
              }`}
            >
              <div className="sidebar-header">
                <h2>Filters</h2>

                <button
                  type="button"
                  onClick={resetFilters}
                >
                  Clear All
                </button>
              </div>

              {/* SEARCH */}

              <div className="filter-group">
                <label htmlFor="product-search">
                  Search Products
                </label>

                <div className="search-box">
                  <span>⌕</span>

                  <input
                    id="product-search"
                    type="text"
                    placeholder="Search laptops..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* CATEGORY */}

              <div className="filter-group">
                <h3>Category</h3>

                <div className="category-filter-list">
                  {categories.map(
                    (category) => (
                      <button
                        type="button"
                        key={category}
                        className={
                          selectedCategory ===
                          category
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          handleCategoryChange(
                            category
                          )
                        }
                      >
                        <span>
                          {category}
                        </span>

                        {selectedCategory ===
                          category && (
                          <span>✓</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* PRICE */}

              <div className="filter-group">
                <h3>Price Range</h3>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="price"
                    value="all"
                    checked={
                      priceFilter ===
                      "all"
                    }
                    onChange={(event) =>
                      setPriceFilter(
                        event.target.value
                      )
                    }
                  />

                  <span>
                    All Prices
                  </span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="price"
                    value="under-50000"
                    checked={
                      priceFilter ===
                      "under-50000"
                    }
                    onChange={(event) =>
                      setPriceFilter(
                        event.target.value
                      )
                    }
                  />

                  <span>
                    Under PKR 50,000
                  </span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="price"
                    value="50000-100000"
                    checked={
                      priceFilter ===
                      "50000-100000"
                    }
                    onChange={(event) =>
                      setPriceFilter(
                        event.target.value
                      )
                    }
                  />

                  <span>
                    PKR 50,000 - 100,000
                  </span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="price"
                    value="100000-200000"
                    checked={
                      priceFilter ===
                      "100000-200000"
                    }
                    onChange={(event) =>
                      setPriceFilter(
                        event.target.value
                      )
                    }
                  />

                  <span>
                    PKR 100,000 - 200,000
                  </span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="price"
                    value="over-200000"
                    checked={
                      priceFilter ===
                      "over-200000"
                    }
                    onChange={(event) =>
                      setPriceFilter(
                        event.target.value
                      )
                    }
                  />

                  <span>
                    Over PKR 200,000
                  </span>
                </label>
              </div>

              {/* AVAILABILITY */}

              <div className="filter-group">
                <h3>Availability</h3>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="availability"
                    value="all"
                    checked={
                      availability ===
                      "all"
                    }
                    onChange={(event) =>
                      setAvailability(
                        event.target.value
                      )
                    }
                  />

                  <span>
                    All Products
                  </span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="availability"
                    value="in-stock"
                    checked={
                      availability ===
                      "in-stock"
                    }
                    onChange={(event) =>
                      setAvailability(
                        event.target.value
                      )
                    }
                  />

                  <span>
                    In Stock
                  </span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="availability"
                    value="out-of-stock"
                    checked={
                      availability ===
                      "out-of-stock"
                    }
                    onChange={(event) =>
                      setAvailability(
                        event.target.value
                      )
                    }
                  />

                  <span>
                    Out of Stock
                  </span>
                </label>
              </div>

              <button
                type="button"
                className="mobile-close-filter"
                onClick={() =>
                  setShowFilters(false)
                }
              >
                Apply Filters
              </button>
            </aside>

            {/* =================================================
                PRODUCT GRID
            ================================================= */}

            <div className="products-content">

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (
                <div className="products-empty-state">

                  <div className="empty-icon">
                    ⟳
                  </div>

                  <h2>
                    Loading Products
                  </h2>

                  <p>
                    Loading products from
                    MongoDB...
                  </p>

                </div>
              ) : loadError ? (

                /* ===============================================
                   DATABASE ERROR
                =============================================== */

                <div className="products-empty-state">

                  <div className="empty-icon">
                    !
                  </div>

                  <h2>
                    Unable to Load Products
                  </h2>

                  <p>
                    {loadError}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                    className="reset-products-button"
                  >
                    Retry
                  </button>

                </div>
              ) : filteredProducts.length > 0 ? (

                /* ===============================================
                   PRODUCT GRID
                =============================================== */

                <div className="products-grid">

                  {filteredProducts.map(
                    (product) => {

                      const productId =
                        getProductId(product);

                      const originalPrice =
                        Number(
                          product?.price || 0
                        );

                      const discountPrice =
                        Number(
                          product?.discount_price
                        );

                      const hasDiscount =
                        Number.isFinite(
                          discountPrice
                        ) &&
                        discountPrice > 0 &&
                        discountPrice <
                          originalPrice;

                      const displayPrice =
                        hasDiscount
                          ? discountPrice
                          : originalPrice;

                      const discount =
                        getDiscount(
                          displayPrice,
                          hasDiscount
                            ? originalPrice
                            : null
                        );

                      const isWishlisted =
                        isInWishlist(
                          productId
                        );

                      const stock =
                        Number(
                          product?.stock || 0
                        );

                      const isOutOfStock =
                        stock <= 0 ||
                        Boolean(
                          product?.is_sold_out
                        );

                      const condition =
                        product?.condition ||
                        product?.device_specs
                          ?.condition ||
                        "";

                      const descriptionText =
                        String(
                          product?.description ||
                          ""
                        )
                          .replace(
                            /<[^>]*>/g,
                            " "
                          )
                          .replace(
                            /\s+/g,
                            " "
                          )
                          .trim();

                      const shortDescription =
                        descriptionText
                          ? descriptionText.length >
                            165
                            ? `${descriptionText.slice(
                                0,
                                165
                              )}...`
                            : descriptionText
                          : "No product description available.";

                      return (
                        <article
                          className="product-card"
                          key={productId}
                        >

                          {/* =====================================
                              PRODUCT IMAGE
                          ===================================== */}

                          <div className="product-card-image-wrapper">

                            <Link
                              to={`/products/${productId}`}
                              className="product-image-link"
                            >
                              <ProductImage
                                product={
                                  product
                                }
                              />
                            </Link>

                            {discount && (
                              <span className="discount-badge">
                                -
                                {discount}
                                %
                              </span>
                            )}

                            <button
                              type="button"
                              className={`wishlist-button ${
                                isWishlisted
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                handleWishlistToggle(
                                  product
                                )
                              }
                              aria-label={
                                isWishlisted
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                              title={
                                isWishlisted
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              {isWishlisted
                                ? "♥"
                                : "♡"}
                            </button>

                            {condition && (
                              <span
                                className={`condition-badge ${
                                  condition
                                    .toLowerCase()
                                    .includes(
                                      "brand"
                                    )
                                    ? "new"
                                    : ""
                                }`}
                              >
                                {condition}
                              </span>
                            )}

                          </div>

                          {/* =====================================
                              PRODUCT INFO
                          ===================================== */}

                          <div className="product-card-info">

                            <span className="product-category">
                              {product?.category ||
                                "Uncategorized"}
                            </span>

                            <Link
                              to={`/products/${productId}`}
                              className="product-title"
                            >
                              {product?.name ||
                                "Unnamed Product"}
                            </Link>

                            <p className="product-short-description">
                              {
                                shortDescription
                              }
                            </p>

                            <StarRating
                              rating={
                                product?.rating ||
                                0
                              }
                              reviews={
                                product?.review_count ||
                                0
                              }
                            />

                            <div className="product-price-row">

                              <strong>
                                {formatPrice(
                                  displayPrice
                                )}
                              </strong>

                              {hasDiscount && (
                                <del>
                                  {formatPrice(
                                    originalPrice
                                  )}
                                </del>
                              )}

                            </div>

                            <div className="stock-status">

                              {!isOutOfStock ? (
                                <>
                                  <span className="stock-dot"></span>

                                  {stock <= 5
                                    ? `Only ${stock} left`
                                    : "In Stock"}
                                </>
                              ) : (
                                <span className="out-of-stock">
                                  Out of Stock
                                </span>
                              )}

                            </div>

                            {/* =================================
                                BUTTONS
                            ================================= */}

                            <div className="product-actions">

                              <Link
                                to={`/products/${productId}`}
                                className="view-description-button"
                              >
                                View Description
                              </Link>

                              <button
                                type="button"
                                className="add-cart-button"
                                onClick={() =>
                                  handleAddToCart(
                                    product
                                  )
                                }
                                disabled={
                                  isOutOfStock
                                }
                              >
                                {!isOutOfStock
                                  ? "Add to Cart"
                                  : "Out of Stock"}
                              </button>

                            </div>

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              ) : (

                /* ===============================================
                   EMPTY STATE
                =============================================== */

                <div className="products-empty-state">

                  <div className="empty-icon">
                    ⌕
                  </div>

                  <h2>
                    No Products Found
                  </h2>

                  <p>
                    There are no products
                    matching your current
                    filters.
                  </p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="reset-products-button"
                  >
                    Clear Filters
                  </button>

                </div>
              )}

              {/* =================================================
                  CART SUMMARY
              ================================================= */}

              {totalItems > 0 && (
                <div className="cart-floating-summary">

                  <div>

                    <strong>
                      {totalItems}{" "}
                      {totalItems === 1
                        ? "item"
                        : "items"}{" "}
                      in cart
                    </strong>

                    <span>
                      Cart is ready for checkout
                    </span>

                  </div>

                  <Link
                    to="/cart"
                    className="cart-summary-button"
                  >
                    View Cart
                  </Link>

                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <Footer />
    </div>
  );
}

export default Products;
