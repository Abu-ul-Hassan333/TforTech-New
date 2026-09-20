import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

import "./ProductDetails.css";

/*
  ============================================================
  PRODUCT DETAILS PAGE
  ============================================================

  This page is prepared for the future FastAPI + MongoDB
  product system.

  Later, the demoProducts data below will be replaced with
  product data coming from the backend.
*/

// ============================================================
// API
// ============================================================

const API_URL = "http://127.0.0.1:8000";

// ============================================================
// DEMO PRODUCT DATA
// ============================================================

const demoProducts = [
  {
    id: "1",
    name: "Dell Latitude 5420",
    price: 85000,
    oldPrice: 92000,
    category: "Laptops",
    condition: "Used - Excellent",
    stock: 7,
    rating: 4.8,
    reviews: 24,
    image: "",
    images: [],
    shortDescription:
      "Reliable business laptop with Intel Core i5, 16GB RAM and 512GB SSD.",
    description:
      "Dell Latitude 5420 is a reliable business laptop designed for office work, university, programming and everyday productivity. It offers a strong balance between performance, portability and durability. The laptop is suitable for users who need dependable performance for daily professional and educational tasks.",
    specifications: {
      Processor: "Intel Core i5",
      RAM: "16GB",
      Storage: "512GB SSD",
      Display: "14-inch Full HD",
      Graphics: "Intel Iris Xe",
      OperatingSystem: "Windows 11",
    },
  },
  {
    id: "2",
    name: "HP EliteBook 840 G8",
    price: 95000,
    oldPrice: 105000,
    category: "Business Laptops",
    condition: "Used - Excellent",
    stock: 4,
    rating: 4.9,
    reviews: 31,
    image: "",
    images: [],
    shortDescription:
      "Premium business laptop with excellent build quality and Full HD display.",
    description:
      "HP EliteBook 840 G8 is designed for professionals, students and users who need a premium and dependable laptop. It features a durable business-class design and excellent everyday performance. Its compact form factor makes it suitable for both office and mobile use.",
    specifications: {
      Processor: "Intel Core i5 11th Gen",
      RAM: "16GB",
      Storage: "512GB SSD",
      Display: "14-inch Full HD",
      Graphics: "Intel Iris Xe",
      OperatingSystem: "Windows 11",
    },
  },
  {
    id: "3",
    name: "Lenovo ThinkPad T14",
    price: 88000,
    oldPrice: 97000,
    category: "Business Laptops",
    condition: "Used - Very Good",
    stock: 6,
    rating: 4.7,
    reviews: 18,
    image: "",
    images: [],
    shortDescription:
      "Durable ThinkPad laptop with comfortable keyboard and powerful productivity performance.",
    description:
      "Lenovo ThinkPad T14 combines durability, performance and excellent usability. It is a strong option for programming, business work, university tasks and daily productivity. The ThinkPad design is focused on comfortable typing and dependable everyday use.",
    specifications: {
      Processor: "Intel Core i5",
      RAM: "16GB",
      Storage: "512GB SSD",
      Display: "14-inch Full HD",
      Graphics: "Intel UHD Graphics",
      OperatingSystem: "Windows 11",
    },
  },
  {
    id: "4",
    name: "Gaming Laptop RTX Series",
    price: 185000,
    oldPrice: 199000,
    category: "Gaming Laptops",
    condition: "Used - Excellent",
    stock: 3,
    rating: 4.9,
    reviews: 42,
    image: "",
    images: [],
    shortDescription:
      "High-performance gaming laptop with dedicated RTX graphics and powerful cooling.",
    description:
      "This gaming laptop is designed for modern games, creative applications and demanding workloads. Dedicated RTX graphics provide strong gaming and graphics performance. It is also suitable for video editing, 3D applications and other demanding tasks.",
    specifications: {
      Processor: "Intel Core i7",
      RAM: "16GB",
      Storage: "1TB SSD",
      Display: "15.6-inch Full HD",
      Graphics: "NVIDIA GeForce RTX",
      OperatingSystem: "Windows 11",
    },
  },
  {
    id: "5",
    name: "Apple MacBook Air M1",
    price: 145000,
    oldPrice: 159000,
    category: "MacBooks",
    condition: "Used - Excellent",
    stock: 5,
    rating: 4.9,
    reviews: 36,
    image: "",
    images: [],
    shortDescription:
      "Lightweight MacBook with Apple M1 chip, excellent battery life and premium design.",
    description:
      "MacBook Air M1 delivers excellent performance in a thin and lightweight design. It is ideal for students, developers, professionals and creative users. The M1 chip provides an excellent balance between performance and power efficiency.",
    specifications: {
      Processor: "Apple M1",
      RAM: "8GB",
      Storage: "256GB SSD",
      Display: "13.3-inch Retina",
      Graphics: "Integrated",
      OperatingSystem: "macOS",
    },
  },
  {
    id: "6",
    name: "Logitech Wireless Mouse",
    price: 4500,
    oldPrice: 5200,
    category: "Mice",
    condition: "Brand New",
    stock: 18,
    rating: 4.6,
    reviews: 15,
    image: "",
    images: [],
    shortDescription:
      "Comfortable wireless mouse suitable for laptops, office work and everyday use.",
    description:
      "A comfortable and reliable wireless mouse designed for everyday laptop and desktop use. Its compact design makes it convenient for work, travel and general productivity.",
    specifications: {
      Connectivity: "Wireless",
      Battery: "AA Battery",
      Compatibility: "Windows / macOS",
      Type: "Optical Mouse",
    },
  },
  {
    id: "7",
    name: "Mechanical Gaming Keyboard",
    price: 8500,
    oldPrice: 10000,
    category: "Keyboards",
    condition: "Brand New",
    stock: 12,
    rating: 4.7,
    reviews: 22,
    image: "",
    images: [],
    shortDescription:
      "Mechanical keyboard designed for gaming, programming and fast typing.",
    description:
      "A mechanical gaming keyboard offering responsive keys and a comfortable typing experience. Suitable for gaming, programming and productivity.",
    specifications: {
      Type: "Mechanical",
      Connectivity: "USB",
      Layout: "Full Size",
      Backlight: "RGB",
    },
  },
  {
    id: "8",
    name: "Laptop Backpack",
    price: 5500,
    oldPrice: 6500,
    category: "Laptop Bags",
    condition: "Brand New",
    stock: 20,
    rating: 4.5,
    reviews: 12,
    image: "",
    images: [],
    shortDescription:
      "Protective laptop backpack with multiple compartments for daily travel.",
    description:
      "A practical laptop backpack designed to protect your laptop while providing enough space for chargers, accessories, documents and other everyday essentials.",
    specifications: {
      Material: "Water Resistant Fabric",
      Compatibility: "Up to 15.6-inch laptops",
      Compartments: "Multiple",
      Type: "Laptop Backpack",
    },
  },
];

// ============================================================
// HELPERS
// ============================================================

const formatPrice = (price) => {
  return `PKR ${Number(price).toLocaleString("en-PK")}`;
};

const getDiscount = (price, oldPrice) => {
  if (!oldPrice || oldPrice <= price) {
    return null;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

// ============================================================
// PRODUCT IMAGE
// ============================================================

function ProductMainImage({ product }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        className="product-details-main-image"
      />
    );
  }

  return (
    <div className="product-details-image-placeholder">
      <span className="large-product-icon">💻</span>
      <span>Product Image</span>
    </div>
  );
}

// ============================================================
// RATING
// ============================================================

function ProductRating({ rating, reviews }) {
  return (
    <div className="details-rating">
      <span className="details-stars">★★★★★</span>

      <strong>{rating}</strong>

      <span className="details-review-count">
        ({reviews} reviews)
      </span>
    </div>
  );
}

// ============================================================
// PRODUCT DETAILS
// ============================================================

function ProductDetails() {
  const { id } = useParams();

  // ----------------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------------

  const navigate = useNavigate();

  // ----------------------------------------------------------
  // CART CONTEXT
  // ----------------------------------------------------------

  const { addToCart } = useCart();

  // ----------------------------------------------------------
  // WISHLIST CONTEXT
  // ----------------------------------------------------------

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [quantity, setQuantity] = useState(1);

  const [cartAdded, setCartAdded] = useState(false);

  const [activeTab, setActiveTab] = useState("description");

  // ----------------------------------------------------------
  // WHATSAPP STATE
  // ----------------------------------------------------------

  const [whatsappSettings, setWhatsappSettings] = useState(
    null
  );

  // ----------------------------------------------------------
  // FIND PRODUCT
  // ----------------------------------------------------------

  const product = useMemo(() => {
    return demoProducts.find(
      (item) => String(item.id) === String(id)
    );
  }, [id]);

  // ----------------------------------------------------------
  // LOAD WHATSAPP SETTINGS
  // ----------------------------------------------------------

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
          throw new Error(
            "Unable to load WhatsApp settings."
          );
        }

        const data = await response.json();

        if (isMounted && data?.success) {
          setWhatsappSettings(data);
        }
      } catch (error) {
        console.error(
          "WhatsApp settings error:",
          error
        );

        if (isMounted) {
          setWhatsappSettings(null);
        }
      }
    };

    fetchWhatsAppSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  // ----------------------------------------------------------
  // WISHLIST STATUS
  // ----------------------------------------------------------

  const isWishlisted = product
    ? isInWishlist(product.id || product._id)
    : false;

  // ----------------------------------------------------------
  // DISCOUNT
  // ----------------------------------------------------------

  const discount = product
    ? getDiscount(product.price, product.oldPrice)
    : null;

  // ----------------------------------------------------------
  // QUANTITY
  // ----------------------------------------------------------

  const increaseQuantity = () => {
    if (!product) {
      return;
    }

    setQuantity((currentQuantity) =>
      Math.min(currentQuantity + 1, product.stock)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.max(currentQuantity - 1, 1)
    );
  };

  // ----------------------------------------------------------
  // ADD TO CART
  // ----------------------------------------------------------

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) {
      return;
    }

    addToCart(product, quantity);

    setCartAdded(true);

    setTimeout(() => {
      setCartAdded(false);
    }, 2500);
  };

  // ----------------------------------------------------------
  // BUY NOW
  // ----------------------------------------------------------

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) {
      return;
    }

    addToCart(product, quantity);

    navigate("/checkout");
  };

  // ----------------------------------------------------------
  // TOGGLE WISHLIST
  // ----------------------------------------------------------

  const handleWishlistToggle = () => {
    if (!product) {
      return;
    }

    toggleWishlist(product);
  };

  // ----------------------------------------------------------
  // ORDER ON WHATSAPP
  // ----------------------------------------------------------

  const handleOrderOnWhatsApp = () => {
    if (!product || product.stock <= 0) {
      return;
    }

    const orderSettings = whatsappSettings?.order;

    if (
      !orderSettings?.enabled ||
      !orderSettings?.phone
    ) {
      return;
    }

    const productUrl = `${window.location.origin}/products/${product.id}`;

    const baseMessage =
      whatsappSettings?.order?.productMessage ||
      "Hello GoJuniors, I am interested in this product.";

    const message = [
      baseMessage,
      "",
      `Product: ${product.name}`,
      `Price: ${formatPrice(product.price)}`,
      `Quantity: ${quantity}`,
      `Total: ${formatPrice(totalPrice)}`,
      `Product Link: ${productUrl}`,
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${orderSettings.phone}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================================
  // PRODUCT NOT FOUND
  // ==========================================================

  if (!product) {
    return (
      <div className="product-details-page">
        <Navbar />

        <main className="product-not-found">
          <div className="product-not-found-icon">⌕</div>

          <h1>Product Not Found</h1>

          <p>
            The product you are looking for does not exist or
            may have been removed.
          </p>

          <Link
            to="/products"
            className="back-to-products-button"
          >
            ← Back to Products
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================================
  // TOTAL PRICE
  // ==========================================================

  const totalPrice = product.price * quantity;

  // ==========================================================
  // WHATSAPP AVAILABILITY
  // ==========================================================

  const showWhatsAppButton =
    Boolean(
      whatsappSettings?.order?.enabled &&
      whatsappSettings?.order?.phone &&
      product.stock > 0
    );

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="product-details-page">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <Navbar />

      {/* ======================================================
          BREADCRUMB
      ====================================================== */}

      <div className="details-breadcrumb-wrapper">
        <div className="details-container">
          <div className="details-breadcrumb">
            <Link to="/">Home</Link>

            <span>/</span>

            <Link to="/products">Products</Link>

            <span>/</span>

            <span>{product.name}</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN PRODUCT SECTION
      ====================================================== */}

      <main className="product-details-main">

        <div className="details-container">

          <div className="product-details-layout">

            {/* =================================================
                IMAGE SECTION
            ================================================= */}

            <div className="product-details-gallery">

              <div className="product-details-image-box">

                {discount && (
                  <span className="details-discount-badge">
                    -{discount}%
                  </span>
                )}

                {/* GLOBAL WISHLIST BUTTON */}

                <button
                  type="button"
                  className={`details-wishlist-button ${
                    isWishlisted ? "active" : ""
                  }`}
                  onClick={handleWishlistToggle}
                  aria-label={
                    isWishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  {isWishlisted ? "♥" : "♡"}
                </button>

                <ProductMainImage product={product} />

              </div>

              {/* ------------------------------------------------
                  FUTURE MULTIPLE IMAGES
              ------------------------------------------------ */}

              {product.images &&
                product.images.length > 0 && (
                  <div className="product-thumbnail-list">

                    {product.images.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        className="product-thumbnail"
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                        />
                      </button>
                    ))}

                  </div>
                )}

            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div className="product-details-info">

              <span className="details-category">
                {product.category}
              </span>

              <h1>{product.name}</h1>

              <ProductRating
                rating={product.rating}
                reviews={product.reviews}
              />

              {/* PRICE */}

              <div className="details-price-row">

                <strong>
                  {formatPrice(product.price)}
                </strong>

                {product.oldPrice && (
                  <del>
                    {formatPrice(product.oldPrice)}
                  </del>
                )}

                {discount && (
                  <span className="details-save-badge">
                    Save {discount}%
                  </span>
                )}

              </div>

              {/* SHORT DESCRIPTION */}

              <p className="details-short-description">
                {product.shortDescription}
              </p>

              {/* PRODUCT META */}

              <div className="product-meta">

                <div className="product-meta-row">
                  <span>Condition</span>

                  <strong>{product.condition}</strong>
                </div>

                <div className="product-meta-row">
                  <span>Category</span>

                  <strong>{product.category}</strong>
                </div>

                <div className="product-meta-row">
                  <span>Availability</span>

                  {product.stock > 0 ? (
                    <strong className="meta-in-stock">
                      In Stock
                    </strong>
                  ) : (
                    <strong className="meta-out-stock">
                      Out of Stock
                    </strong>
                  )}
                </div>

                {product.stock > 0 &&
                  product.stock <= 5 && (
                    <div className="limited-stock-message">
                      Only {product.stock} left in stock
                    </div>
                  )}

              </div>

              {/* DIVIDER */}

              <div className="details-divider"></div>

              {/* QUANTITY */}

              {product.stock > 0 && (
                <div className="quantity-section">

                  <span className="quantity-label">
                    Quantity
                  </span>

                  <div className="quantity-control">

                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                  </div>

                  <span className="quantity-total">
                    Total: {formatPrice(totalPrice)}
                  </span>

                </div>
              )}

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="details-action-buttons">

                <button
                  type="button"
                  className="details-add-cart-button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  {cartAdded
                    ? "✓ Added to Cart"
                    : product.stock > 0
                    ? "Add to Cart"
                    : "Out of Stock"}
                </button>

                <button
                  type="button"
                  className="details-buy-now-button"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </button>

              </div>

              {/* =================================================
                  ORDER ON WHATSAPP
              ================================================= */}

              {showWhatsAppButton && (
                <button
                  type="button"
                  className="details-whatsapp-button"
                  onClick={handleOrderOnWhatsApp}
                >
                  <FaWhatsapp />

                  <span>
                    Order on WhatsApp
                  </span>
                </button>
              )}

              {/* =================================================
                  WISHLIST
              ================================================= */}

              <button
                type="button"
                className={`details-wishlist-link ${
                  isWishlisted ? "active" : ""
                }`}
                onClick={handleWishlistToggle}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isWishlisted ? "♥" : "♡"}

                <span>
                  {isWishlisted
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"}
                </span>
              </button>

              {/* =================================================
                  TRUST INFORMATION
              ================================================= */}

              <div className="details-trust-box">

                <div className="trust-item">
                  <span className="trust-icon">✓</span>

                  <div>
                    <strong>Quality Checked</strong>

                    <span>
                      Product information is clearly listed
                    </span>
                  </div>
                </div>

                <div className="trust-item">
                  <span className="trust-icon">🚚</span>

                  <div>
                    <strong>Fast Delivery</strong>

                    <span>
                      Safe delivery across Pakistan
                    </span>
                  </div>
                </div>

                <div className="trust-item">
                  <span className="trust-icon">↩</span>

                  <div>
                    <strong>Easy Returns</strong>

                    <span>
                      Simple return process
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ====================================================
              DETAILED INFORMATION TABS
          ==================================================== */}

          <section className="product-information-section">

            <div className="details-tabs">

              <button
                type="button"
                className={
                  activeTab === "description"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("description")
                }
              >
                Description
              </button>

              <button
                type="button"
                className={
                  activeTab === "specifications"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("specifications")
                }
              >
                Specifications
              </button>

              <button
                type="button"
                className={
                  activeTab === "condition"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("condition")
                }
              >
                Condition
              </button>

            </div>

            <div className="details-tab-content">

              {/* DESCRIPTION */}

              {activeTab === "description" && (
                <div className="description-content">

                  <h2>Product Description</h2>

                  <p>{product.description}</p>

                  <p>
                    This product is presented with complete
                    information so customers can make an
                    informed purchasing decision.
                  </p>

                </div>
              )}

              {/* SPECIFICATIONS */}

              {activeTab === "specifications" && (
                <div className="specifications-content">

                  <h2>Specifications</h2>

                  <div className="specifications-table">

                    {Object.entries(
                      product.specifications || {}
                    ).map(([key, value]) => (
                      <div
                        className="specification-row"
                        key={key}
                      >
                        <span>{key}</span>

                        <strong>{value}</strong>
                      </div>
                    ))}

                  </div>

                </div>
              )}

              {/* CONDITION */}

              {activeTab === "condition" && (
                <div className="condition-content">

                  <h2>Product Condition</h2>

                  <div className="condition-highlight">

                    <span className="condition-check">
                      ✓
                    </span>

                    <div>

                      <strong>
                        {product.condition}
                      </strong>

                      <p>
                        The condition of this product is
                        clearly mentioned so you know what
                        to expect before placing your order.
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>
          </section>

          {/* ====================================================
              BACK TO PRODUCTS
          ==================================================== */}

          <div className="back-products-wrapper">

            <Link
              to="/products"
              className="back-products-link"
            >
              ← Continue Shopping
            </Link>

          </div>

        </div>
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <Footer />

    </div>
  );
}

export default ProductDetails;