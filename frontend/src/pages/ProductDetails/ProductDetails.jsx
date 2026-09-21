import React, {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

import "./ProductDetails.css";

const API_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const getProductId = (product) => {
  return (
    product?.product_id ||
    product?.id ||
    product?._id ||
    null
  );
};

const getProductImages = (product) => {
  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    return product.images.filter(Boolean);
  }

  if (
    Array.isArray(product?.image_urls) &&
    product.image_urls.length > 0
  ) {
    return product.image_urls.filter(Boolean);
  }

  if (product?.image) {
    return [product.image];
  }

  if (product?.image_url) {
    return [product.image_url];
  }

  return [];
};

const normalizeProduct = (
  product,
  fallbackId
) => {
  if (!product) {
    return null;
  }

  const productId =
    getProductId(product) ||
    fallbackId;

  const images =
    getProductImages(product);

  const oldPriceValue =
    product?.oldPrice ??
    product?.old_price ??
    null;

  const ratingValue =
    Number(
      product?.rating ?? 0
    );

  const reviewsValue =
    Array.isArray(
      product?.reviews
    )
      ? product.reviews.length
      : Number(
          product?.reviews ?? 0
        );

  const primaryImage =
    images.length > 0
      ? images[0]
      : product?.image ||
        product?.image_url ||
        "";

  return {
    ...product,

    id: String(
      productId
    ),

    _id:
      product?._id ||
      productId,

    name:
      product?.name ||
      "Unnamed Product",

    price:
      Number(
        product?.price ?? 0
      ),

    oldPrice:
      oldPriceValue !== null
        ? Number(
            oldPriceValue
          )
        : null,

    category:
      product?.category ||
      "Products",

    condition:
      product?.condition ||
      "Available",

    stock:
      Number(
        product?.stock ?? 0
      ),

    rating:
      Number.isFinite(
        ratingValue
      )
        ? ratingValue
        : 0,

    reviews:
      Number.isFinite(
        reviewsValue
      )
        ? reviewsValue
        : 0,

    image:
      primaryImage,

    images,

    shortDescription:
      product?.shortDescription ||
      product?.short_description ||
      "",

    description:
      product?.description ||
      "",

    specifications:
      product?.specifications ||
      {},
  };
};

const formatPrice = (
  price
) => {
  return `PKR ${Number(
    price || 0
  ).toLocaleString("en-PK")}`;
};

const getDiscount = (
  price,
  oldPrice
) => {
  if (
    !oldPrice ||
    oldPrice <= price
  ) {
    return null;
  }

  return Math.round(
    ((oldPrice - price) /
      oldPrice) *
      100
  );
};

const getFinalImageUrl = (
  image
) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith(
      "http://"
    ) ||
    image.startsWith(
      "https://"
    ) ||
    image.startsWith(
      "data:"
    ) ||
    image.startsWith(
      "blob:"
    )
  ) {
    return image;
  }

  return `${API_URL}${
    image.startsWith("/")
      ? ""
      : "/"
  }${image}`;
};

function ProductMainImage({
  image,
  productName,
}) {
  if (image) {
    const finalImageUrl =
      getFinalImageUrl(
        image
      );

    return (
      <img
        src={
          finalImageUrl
        }
        alt={
          productName
        }
        className="product-details-main-image"
        onError={(
          event
        ) => {
          event.currentTarget.style.display =
            "none";
        }}
      />
    );
  }

  return (
    <div className="product-details-image-placeholder">
      <span className="large-product-icon">
        💻
      </span>

      <span>
        Product Image
      </span>
    </div>
  );
}

function ProductRating({
  rating,
  reviews,
}) {
  const safeRating =
    Number(
      rating || 0
    );

  return (
    <div className="details-rating">
      <span className="details-stars">
        ★★★★★
      </span>

      <strong>
        {safeRating > 0
          ? safeRating.toFixed(
              1
            )
          : "0.0"}
      </strong>

      <span className="details-review-count">
        (
        {Number(
          reviews || 0
        ).toLocaleString(
          "en-PK"
        )}{" "}
        reviews)
      </span>
    </div>
  );
}

function ProductDetails() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const { addToCart } =
    useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } =
    useWishlist();

  const [
    product,
    setProduct,
  ] = useState(
    null
  );

  const [
    productLoading,
    setProductLoading,
  ] = useState(
    true
  );

  const [
    productError,
    setProductError,
  ] = useState(
    ""
  );

  const [
    activeImage,
    setActiveImage,
  ] = useState(
    ""
  );

  const [
    quantity,
    setQuantity,
  ] = useState(
    1
  );

  const [
    cartAdded,
    setCartAdded,
  ] = useState(
    false
  );

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "description"
  );

  const [
    whatsappSettings,
    setWhatsappSettings,
  ] = useState(
    null
  );

  useEffect(() => {
    let isMounted =
      true;

    const fetchProduct =
      async () => {
        setProductLoading(
          true
        );

        setProductError("");

        setProduct(
          null
        );

        setActiveImage(
          ""
        );

        setQuantity(
          1
        );

        try {
          const response =
            await fetch(
              `${API_URL}/api/products/${encodeURIComponent(
                id
              )}`,
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
            if (
              response.status ===
              404
            ) {
              throw new Error(
                "The product you are looking for does not exist or may have been removed."
              );
            }

            throw new Error(
              "Unable to load product details."
            );
          }

          const data =
            await response.json();

          const receivedProduct =
            data?.product ||
            data?.item ||
            data?.data ||
            data;

          const normalizedProduct =
            normalizeProduct(
              receivedProduct,
              id
            );

          if (
            !normalizedProduct
          ) {
            throw new Error(
              "The product you are looking for does not exist or may have been removed."
            );
          }

          if (
            isMounted
          ) {
            setProduct(
              normalizedProduct
            );

            const images =
              normalizedProduct.images ||
              [];

            setActiveImage(
              images.length > 0
                ? images[0]
                : normalizedProduct.image ||
                  ""
            );
          }
        } catch (
          error
        ) {
          console.error(
            "Product details loading error:",
            error
          );

          if (
            isMounted
          ) {
            setProduct(
              null
            );

            setActiveImage(
              ""
            );

            setProductError(
              error.message ||
                "Unable to load product details."
            );
          }
        } finally {
          if (
            isMounted
          ) {
            setProductLoading(
              false
            );
          }
        }
      };

    if (id) {
      fetchProduct();
    } else {
      setProductLoading(
        false
      );

      setProductError(
        "Invalid product."
      );
    }

    return () => {
      isMounted =
        false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted =
      true;

    const fetchWhatsAppSettings =
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/api/whatsapp/public`,
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
              "Unable to load WhatsApp settings."
            );
          }

          const data =
            await response.json();

          if (
            isMounted &&
            data?.success
          ) {
            setWhatsappSettings(
              data
            );
          }
        } catch (
          error
        ) {
          console.error(
            "WhatsApp settings error:",
            error
          );

          if (
            isMounted
          ) {
            setWhatsappSettings(
              null
            );
          }
        }
      };

    fetchWhatsAppSettings();

    return () => {
      isMounted =
        false;
    };
  }, []);

  const isWishlisted =
    product
      ? isInWishlist(
          product.id ||
            product._id
        )
      : false;

  const discount =
    product
      ? getDiscount(
          product.price,
          product.oldPrice
        )
      : null;

  const increaseQuantity =
    () => {
      if (
        !product
      ) {
        return;
      }

      setQuantity(
        (
          currentQuantity
        ) =>
          Math.min(
            currentQuantity +
              1,
            product.stock
          )
      );
    };

  const decreaseQuantity =
    () => {
      setQuantity(
        (
          currentQuantity
        ) =>
          Math.max(
            currentQuantity -
              1,
            1
          )
      );
    };

  const handleAddToCart =
    () => {
      if (
        !product ||
        product.stock <=
          0
      ) {
        return;
      }

      addToCart(
        product,
        quantity
      );

      setCartAdded(
        true
      );

      setTimeout(
        () => {
          setCartAdded(
            false
          );
        },
        2500
      );
    };

  const handleBuyNow =
    () => {
      if (
        !product ||
        product.stock <=
          0
      ) {
        return;
      }

      addToCart(
        product,
        quantity
      );

      navigate(
        "/checkout"
      );
    };

  const handleWishlistToggle =
    () => {
      if (
        !product
      ) {
        return;
      }

      toggleWishlist(
        product
      );
    };

  const totalPrice =
    product
      ? Number(
          product.price || 0
        ) *
        quantity
      : 0;

  const handleOrderOnWhatsApp =
    () => {
      if (
        !product ||
        product.stock <=
          0
      ) {
        return;
      }

      const orderSettings =
        whatsappSettings?.order;

      if (
        !orderSettings?.enabled ||
        !orderSettings?.phone
      ) {
        return;
      }

      const productId =
        getProductId(
          product
        );

      const productUrl =
        `${window.location.origin}/products/${productId}`;

      const baseMessage =
        whatsappSettings
          ?.order
          ?.productMessage ||
        "Hello GoJuniors, I am interested in this product.";

      const message =
        [
          baseMessage,
          "",
          `Product: ${product.name}`,
          `Price: ${formatPrice(
            product.price
          )}`,
          `Quantity: ${quantity}`,
          `Total: ${formatPrice(
            totalPrice
          )}`,
          `Product Link: ${productUrl}`,
        ].join(
          "\n"
        );

      const whatsappUrl =
        `https://wa.me/${orderSettings.phone}` +
        `?text=${encodeURIComponent(
          message
        )}`;

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );
    };

  if (
    productLoading
  ) {
    return (
      <div className="product-details-page">
        <Navbar />

        <main className="product-not-found">
          <div
            className="product-details-loading-spinner"
            style={{
              width:
                "42px",
              height:
                "42px",
              margin:
                "0 auto 18px",
              border:
                "4px solid #e5e7eb",
              borderTopColor:
                "#111827",
              borderRadius:
                "50%",
              animation:
                "productDetailsSpin 0.8s linear infinite",
            }}
          />

          <h1>
            Loading Product...
          </h1>

          <p>
            Please wait while we load the
            product details.
          </p>
        </main>

        <Footer />

        <style>
          {`
            @keyframes productDetailsSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  if (
    !product
  ) {
    return (
      <div className="product-details-page">
        <Navbar />

        <main className="product-not-found">
          <div className="product-not-found-icon">
            ⌕
          </div>

          <h1>
            Product Not Found
          </h1>

          <p>
            {productError ||
              "The product you are looking for does not exist or may have been removed."}
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

  const productImages =
    Array.isArray(
      product.images
    ) &&
    product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const currentImage =
    activeImage ||
    productImages[0] ||
    product.image ||
    "";

  const showWhatsAppButton =
    Boolean(
      whatsappSettings
        ?.order
        ?.enabled &&
        whatsappSettings
          ?.order
          ?.phone &&
        product.stock > 0
    );

  return (
    <div className="product-details-page">
      <Navbar />

      <div className="details-breadcrumb-wrapper">
        <div className="details-container">
          <div className="details-breadcrumb">
            <Link to="/">
              Home
            </Link>

            <span>
              /
            </span>

            <Link to="/products">
              Products
            </Link>

            <span>
              /
            </span>

            <span>
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <main className="product-details-main">
        <div className="details-container">
          <div className="product-details-layout">
            <div className="product-details-gallery">
              <div className="product-details-image-box">
                {discount && (
                  <span className="details-discount-badge">
                    -{discount}%
                  </span>
                )}

                <button
                  type="button"
                  className={`details-wishlist-button ${
                    isWishlisted
                      ? "active"
                      : ""
                  }`}
                  onClick={
                    handleWishlistToggle
                  }
                  aria-label={
                    isWishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  {isWishlisted
                    ? "♥"
                    : "♡"}
                </button>

                <ProductMainImage
                  image={
                    currentImage
                  }
                  productName={
                    product.name
                  }
                />
              </div>

              {productImages.length >
                1 && (
                <div className="product-thumbnail-list">
                  {productImages.map(
                    (
                      image,
                      index
                    ) => {
                      const finalImageUrl =
                        getFinalImageUrl(
                          image
                        );

                      const isActive =
                        String(
                          activeImage
                        ) ===
                        String(
                          image
                        );

                      return (
                        <button
                          type="button"
                          key={`${image}-${index}`}
                          className={`product-thumbnail ${
                            isActive
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setActiveImage(
                              image
                            )
                          }
                          aria-label={`View product image ${
                            index +
                            1
                          }`}
                          aria-pressed={
                            isActive
                          }
                        >
                          <img
                            src={
                              finalImageUrl
                            }
                            alt={`${product.name} ${
                              index +
                              1
                            }`}
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.opacity =
                                "0.4";
                            }}
                          />
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <div className="product-details-info">
              <span className="details-category">
                {product.category}
              </span>

              <h1>
                {product.name}
              </h1>

              <ProductRating
                rating={
                  product.rating
                }
                reviews={
                  product.reviews
                }
              />

              <div className="details-price-row">
                <strong>
                  {formatPrice(
                    product.price
                  )}
                </strong>

                {product.oldPrice &&
                  product.oldPrice >
                    product.price && (
                    <del>
                      {formatPrice(
                        product.oldPrice
                      )}
                    </del>
                  )}

                {discount && (
                  <span className="details-save-badge">
                    Save {discount}%
                  </span>
                )}
              </div>

              <p className="details-short-description">
                {product.shortDescription ||
                  "Product details and description are available below."}
              </p>

              <div className="product-meta">
                <div className="product-meta-row">
                  <span>
                    Condition
                  </span>

                  <strong>
                    {product.condition}
                  </strong>
                </div>

                <div className="product-meta-row">
                  <span>
                    Category
                  </span>

                  <strong>
                    {product.category}
                  </strong>
                </div>

                <div className="product-meta-row">
                  <span>
                    Availability
                  </span>

                  {product.stock >
                  0 ? (
                    <strong className="meta-in-stock">
                      In Stock
                    </strong>
                  ) : (
                    <strong className="meta-out-stock">
                      Out of Stock
                    </strong>
                  )}
                </div>

                {product.stock >
                  0 &&
                  product.stock <=
                    5 && (
                    <div className="limited-stock-message">
                      Only{" "}
                      {
                        product.stock
                      }{" "}
                      left in stock
                    </div>
                  )}
              </div>

              <div className="details-divider"></div>

              {product.stock >
                0 && (
                <div className="quantity-section">
                  <span className="quantity-label">
                    Quantity
                  </span>

                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <=
                        1
                      }
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span>
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >=
                        product.stock
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className="quantity-total">
                    Total:{" "}
                    {formatPrice(
                      totalPrice
                    )}
                  </span>
                </div>
              )}

              <div className="details-action-buttons">
                <button
                  type="button"
                  className="details-add-cart-button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    product.stock <=
                    0
                  }
                >
                  {cartAdded
                    ? "✓ Added to Cart"
                    : product.stock >
                      0
                    ? "Add to Cart"
                    : "Out of Stock"}
                </button>

                <button
                  type="button"
                  className="details-buy-now-button"
                  onClick={
                    handleBuyNow
                  }
                  disabled={
                    product.stock <=
                    0
                  }
                >
                  Buy Now
                </button>
              </div>

              {showWhatsAppButton && (
                <button
                  type="button"
                  className="details-whatsapp-button"
                  onClick={
                    handleOrderOnWhatsApp
                  }
                >
                  <FaWhatsapp />

                  <span>
                    Order on WhatsApp
                  </span>
                </button>
              )}

              <button
                type="button"
                className={`details-wishlist-link ${
                  isWishlisted
                    ? "active"
                    : ""
                }`}
                onClick={
                  handleWishlistToggle
                }
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {isWishlisted
                  ? "♥"
                  : "♡"}

                <span>
                  {isWishlisted
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"}
                </span>
              </button>

              <div className="details-trust-box">
                <div className="trust-item">
                  <span className="trust-icon">
                    ✓
                  </span>

                  <div>
                    <strong>
                      Quality Checked
                    </strong>

                    <span>
                      Product information is clearly listed
                    </span>
                  </div>
                </div>

                <div className="trust-item">
                  <span className="trust-icon">
                    🚚
                  </span>

                  <div>
                    <strong>
                      Fast Delivery
                    </strong>

                    <span>
                      Safe delivery across Pakistan
                    </span>
                  </div>
                </div>

                <div className="trust-item">
                  <span className="trust-icon">
                    ↩
                  </span>

                  <div>
                    <strong>
                      Easy Returns
                    </strong>

                    <span>
                      Simple return process
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="product-information-section">
            <div className="details-tabs">
              <button
                type="button"
                className={
                  activeTab ===
                  "description"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "description"
                  )
                }
              >
                Description
              </button>

              <button
                type="button"
                className={
                  activeTab ===
                  "specifications"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "specifications"
                  )
                }
              >
                Specifications
              </button>

              <button
                type="button"
                className={
                  activeTab ===
                  "condition"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    "condition"
                  )
                }
              >
                Condition
              </button>
            </div>

            <div className="details-tab-content">
              {activeTab ===
                "description" && (
                <div className="description-content">
                  <h2>
                    Product Description
                  </h2>

                  <p>
                    {product.description ||
                      product.shortDescription ||
                      "No product description is available."}
                  </p>

                  {product.description && (
                    <p>
                      This product is presented with complete
                      information so customers can make an
                      informed purchasing decision.
                    </p>
                  )}
                </div>
              )}

              {activeTab ===
                "specifications" && (
                <div className="specifications-content">
                  <h2>
                    Specifications
                  </h2>

                  {Object.keys(
                    product.specifications ||
                      {}
                  ).length >
                  0 ? (
                    <div className="specifications-table">
                      {Object.entries(
                        product.specifications ||
                          {}
                      ).map(
                        (
                          [
                            key,
                            value,
                          ]
                        ) => (
                          <div
                            className="specification-row"
                            key={
                              key
                            }
                          >
                            <span>
                              {key}
                            </span>

                            <strong>
                              {String(
                                value ??
                                  ""
                              )}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p>
                      No specifications are
                      available for this product.
                    </p>
                  )}
                </div>
              )}

              {activeTab ===
                "condition" && (
                <div className="condition-content">
                  <h2>
                    Product Condition
                  </h2>

                  <div className="condition-highlight">
                    <span className="condition-check">
                      ✓
                    </span>

                    <div>
                      <strong>
                        {
                          product.condition
                        }
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

      <Footer />
    </div>
  );
}

export default ProductDetails;
