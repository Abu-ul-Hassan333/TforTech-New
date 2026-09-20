import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Wishlist.css";

const Wishlist = () => {
  const {
    wishlistItems,
    wishlistCount,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PK").format(
      Number(price || 0)
    );
  };

  const getProductId = (product) => {
    return product.id || product._id;
  };

  const handleAddToCart = (product) => {
    if (!product || Number(product.stock || 0) <= 0) {
      return;
    }

    addToCart(product, 1);
  };

  return (
    <>
      <Navbar />

      <main className="wishlist-page">

        {/* =========================
            WISHLIST HERO
        ========================== */}
        <section className="wishlist-hero">
          <div className="wishlist-container">
            <span className="wishlist-eyebrow">
              Your saved products
            </span>

            <h1>My Wishlist</h1>

            <p>
              Keep your favorite laptops and accessories in one place
              and come back to them whenever you are ready.
            </p>

            <div className="wishlist-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Wishlist</span>
            </div>
          </div>
        </section>

        {/* =========================
            WISHLIST CONTENT
        ========================== */}
        <section className="wishlist-content">
          <div className="wishlist-container">

            {/* =========================
                EMPTY WISHLIST
            ========================== */}
            {wishlistItems.length === 0 ? (
              <div className="wishlist-empty">

                <div className="wishlist-empty-icon">
                  ♡
                </div>

                <h2>Your wishlist is empty</h2>

                <p>
                  You haven't saved any products yet.
                  Browse our products and add your favorites here.
                </p>

                <Link
                  to="/products"
                  className="wishlist-shop-button"
                >
                  Browse Products
                </Link>

              </div>
            ) : (
              <>
                {/* =========================
                    WISHLIST HEADER
                ========================== */}
                <div className="wishlist-topbar">

                  <div>
                    <span className="wishlist-count-label">
                      {wishlistCount}{" "}
                      {wishlistCount === 1
                        ? "product"
                        : "products"}{" "}
                      saved
                    </span>

                    <h2>Your Favorites</h2>
                  </div>

                  <button
                    type="button"
                    className="wishlist-clear-button"
                    onClick={clearWishlist}
                  >
                    Clear Wishlist
                  </button>

                </div>

                {/* =========================
                    WISHLIST GRID
                ========================== */}
                <div className="wishlist-grid">

                  {wishlistItems.map((product) => {
                    const productId = getProductId(product);

                    const stock = Number(product.stock || 0);

                    const hasDiscount =
                      product.oldPrice &&
                      Number(product.oldPrice) > Number(product.price);

                    const discountPercentage = hasDiscount
                      ? Math.round(
                          ((Number(product.oldPrice) -
                            Number(product.price)) /
                            Number(product.oldPrice)) *
                            100
                        )
                      : 0;

                    return (
                      <article
                        className="wishlist-card"
                        key={productId}
                      >

                        {/* =========================
                            PRODUCT IMAGE
                        ========================== */}
                        <div className="wishlist-image-wrapper">

                          {hasDiscount && (
                            <span className="wishlist-discount">
                              -{discountPercentage}%
                            </span>
                          )}

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="wishlist-product-image"
                            />
                          ) : (
                            <div className="wishlist-image-placeholder">
                              <span>💻</span>
                              <small>No Image</small>
                            </div>
                          )}

                          <button
                            type="button"
                            className="wishlist-remove-button"
                            onClick={() =>
                              removeFromWishlist(productId)
                            }
                            aria-label={`Remove ${product.name} from wishlist`}
                            title="Remove from wishlist"
                          >
                            ♥
                          </button>

                        </div>

                        {/* =========================
                            PRODUCT INFORMATION
                        ========================== */}
                        <div className="wishlist-card-content">

                          <div className="wishlist-product-category">
                            {product.category || "Laptop & Accessories"}
                          </div>

                          <Link
                            to={`/products/${productId}`}
                            className="wishlist-product-name"
                          >
                            {product.name}
                          </Link>

                          {product.shortDescription && (
                            <p className="wishlist-product-description">
                              {product.shortDescription}
                            </p>
                          )}

                          {/* PRICE */}
                          <div className="wishlist-price-row">

                            <strong>
                              PKR {formatPrice(product.price)}
                            </strong>

                            {hasDiscount && (
                              <span className="wishlist-old-price">
                                PKR {formatPrice(product.oldPrice)}
                              </span>
                            )}

                          </div>

                          {/* CONDITION / STOCK */}
                          <div className="wishlist-meta">

                            {product.condition && (
                              <span>
                                {product.condition}
                              </span>
                            )}

                            <span
                              className={
                                stock > 0
                                  ? "wishlist-in-stock"
                                  : "wishlist-out-stock"
                              }
                            >
                              {stock > 0
                                ? `${stock} in stock`
                                : "Out of stock"}
                            </span>

                          </div>

                          {/* ACTIONS */}
                          <div className="wishlist-actions">

                            <Link
                              to={`/products/${productId}`}
                              className="wishlist-view-button"
                            >
                              View Details
                            </Link>

                            <button
                              type="button"
                              className="wishlist-cart-button"
                              onClick={() =>
                                handleAddToCart(product)
                              }
                              disabled={stock <= 0}
                            >
                              {stock > 0
                                ? "Add to Cart"
                                : "Out of Stock"}
                            </button>

                          </div>

                        </div>
                      </article>
                    );
                  })}

                </div>

                {/* =========================
                    BOTTOM CTA
                ========================== */}
                <div className="wishlist-bottom">

                  <div>
                    <h3>Looking for something else?</h3>

                    <p>
                      Explore more laptops, MacBooks and accessories.
                    </p>
                  </div>

                  <Link
                    to="/products"
                    className="wishlist-continue-button"
                  >
                    Continue Shopping
                  </Link>

                </div>
              </>
            )}

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
};

export default Wishlist;