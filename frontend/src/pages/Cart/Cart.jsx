import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  // ============================================================
  // CART CONTEXT
  // ============================================================

  const {
    cartItems,
    totalItems,
    subtotal,
    delivery,
    grandTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // ============================================================
  // FORMAT PRICE
  // ============================================================

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PK").format(
      Number(price || 0)
    );
  };

  // ============================================================
  // CHECKOUT
  // ============================================================

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    navigate("/checkout");
  };

  // ============================================================
  // PRODUCT ID
  // ============================================================

  const getProductId = (item) => {
    return item.id || item._id;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="cart-page">
      <Navbar />

      <main>
        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="cart-hero">
          <div className="cart-container">
            <p className="cart-eyebrow">
              YOUR SHOPPING CART
            </p>

            <h1>
              Your Cart
            </h1>

            <p>
              Review your selected laptops and accessories before
              continuing to checkout.
            </p>
          </div>
        </section>

        {/* ======================================================
            CART CONTENT
        ====================================================== */}

        <section className="cart-main">
          <div className="cart-container">

            {cartItems.length === 0 ? (

              /* ==================================================
                 EMPTY CART
                 ================================================== */

              <div className="cart-empty">
                <div className="cart-empty-icon">
                  🛒
                </div>

                <h2>
                  Your cart is empty
                </h2>

                <p>
                  You haven't added any products to your cart yet.
                  Explore our laptops and accessories and find
                  something that fits your needs.
                </p>

                <div className="cart-empty-actions">

                  <Link
                    to="/products"
                    className="cart-primary-btn"
                  >
                    Browse Products
                  </Link>

                  <Link
                    to="/categories"
                    className="cart-secondary-btn"
                  >
                    View Categories
                  </Link>

                </div>
              </div>

            ) : (

              /* ==================================================
                 CART WITH PRODUCTS
                 ================================================== */

              <div className="cart-layout">

                {/* =================================================
                    LEFT SIDE — CART ITEMS
                    ================================================= */}

                <div className="cart-items-section">

                  <div className="cart-section-header">

                    <div>
                      <p className="cart-section-eyebrow">
                        SHOPPING BAG
                      </p>

                      <h2>
                        Your Items{" "}
                        <span>
                          ({totalItems}{" "}
                          {totalItems === 1
                            ? "item"
                            : "items"}
                          )
                        </span>
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="cart-clear-btn"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>

                  </div>

                  <div className="cart-items-list">

                    {cartItems.map((item) => {
                      const productId = getProductId(item);

                      const itemTotal =
                        Number(item.price || 0) *
                        Number(item.quantity || 0);

                      const stock =
                        typeof item.stock === "number"
                          ? item.stock
                          : null;

                      return (
                        <article
                          className="cart-item"
                          key={productId}
                        >

                          {/* =================================================
                              PRODUCT IMAGE
                              ================================================= */}

                          <div className="cart-item-image-wrapper">

                            {item.image ? (

                              <img
                                src={item.image}
                                alt={item.name}
                                className="cart-item-image"
                              />

                            ) : (

                              <div className="cart-item-image-placeholder">
                                <span>
                                  {item.name
                                    ? item.name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "P"}
                                </span>
                              </div>

                            )}

                          </div>

                          {/* =================================================
                              PRODUCT INFORMATION
                              ================================================= */}

                          <div className="cart-item-info">

                            <p className="cart-item-category">
                              {item.category ||
                                "Laptop & Accessories"}
                            </p>

                            <Link
                              to={`/products/${productId}`}
                              className="cart-item-name"
                            >
                              {item.name}
                            </Link>

                            {item.condition && (
                              <p className="cart-item-condition">
                                Condition:{" "}
                                <strong>
                                  {item.condition}
                                </strong>
                              </p>
                            )}

                            <p className="cart-item-price-mobile">
                              PKR{" "}
                              {formatPrice(item.price || 0)}
                            </p>

                            {/* =================================================
                                QUANTITY + REMOVE
                                ================================================= */}

                            <div className="cart-item-actions">

                              <div className="cart-quantity">

                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(
                                      productId
                                    )
                                  }
                                  disabled={
                                    Number(item.quantity || 0) <= 1
                                  }
                                  aria-label={`Decrease quantity of ${item.name}`}
                                >
                                  −
                                </button>

                                <span>
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(
                                      productId
                                    )
                                  }
                                  disabled={
                                    stock !== null &&
                                    Number(item.quantity || 0) >=
                                      stock
                                  }
                                  aria-label={`Increase quantity of ${item.name}`}
                                >
                                  +
                                </button>

                              </div>

                              <button
                                type="button"
                                className="cart-remove-btn"
                                onClick={() =>
                                  removeFromCart(
                                    productId
                                  )
                                }
                              >
                                Remove
                              </button>

                            </div>

                          </div>

                          {/* =================================================
                              PRODUCT PRICE
                              ================================================= */}

                          <div className="cart-item-total">

                            <span className="cart-item-unit-price">
                              PKR{" "}
                              {formatPrice(
                                item.price || 0
                              )}
                            </span>

                            <strong>
                              PKR{" "}
                              {formatPrice(itemTotal)}
                            </strong>

                          </div>

                        </article>
                      );
                    })}

                  </div>

                  {/* =================================================
                      CONTINUE SHOPPING
                      ================================================= */}

                  <div className="cart-continue">
                    <Link to="/products">
                      ← Continue Shopping
                    </Link>
                  </div>

                </div>

                {/* =================================================
                    RIGHT SIDE — ORDER SUMMARY
                    ================================================= */}

                <aside className="cart-summary">

                  <div className="cart-summary-header">

                    <p className="cart-section-eyebrow">
                      ORDER SUMMARY
                    </p>

                    <h2>
                      Summary
                    </h2>

                  </div>

                  <div className="cart-summary-rows">

                    <div className="cart-summary-row">

                      <span>
                        Subtotal ({totalItems}{" "}
                        {totalItems === 1
                          ? "item"
                          : "items"})
                      </span>

                      <strong>
                        PKR{" "}
                        {formatPrice(subtotal)}
                      </strong>

                    </div>

                    <div className="cart-summary-row">

                      <span>
                        Delivery
                      </span>

                      <strong>
                        {delivery === 0
                          ? "FREE"
                          : `PKR ${formatPrice(
                              delivery
                            )}`}
                      </strong>

                    </div>

                  </div>

                  {/* =================================================
                      FREE DELIVERY NOTICE
                      ================================================= */}

                  {subtotal > 0 &&
                    subtotal < 50000 && (
                      <div className="cart-delivery-notice">
                        Add{" "}
                        <strong>
                          PKR{" "}
                          {formatPrice(
                            50000 - subtotal
                          )}
                        </strong>{" "}
                        more to get free delivery.
                      </div>
                    )}

                  {subtotal >= 50000 && (
                    <div className="cart-delivery-notice cart-free-delivery">
                      🎉 Your order qualifies for free
                      delivery.
                    </div>
                  )}

                  {/* =================================================
                      TOTAL
                      ================================================= */}

                  <div className="cart-summary-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      PKR{" "}
                      {formatPrice(grandTotal)}
                    </strong>

                  </div>

                  {/* =================================================
                      CHECKOUT
                      ================================================= */}

                  <button
                    type="button"
                    className="cart-checkout-btn"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>

                  {/* =================================================
                      SECURITY NOTE
                      ================================================= */}

                  <div className="cart-secure-note">

                    <span>
                      🔒
                    </span>

                    <p>
                      Secure checkout. Your order information
                      will be handled safely.
                    </p>

                  </div>

                  {/* =================================================
                      PAYMENT NOTE
                      ================================================= */}

                  <div className="cart-payment-note">

                    <span>
                      Payment options
                    </span>

                    <strong>
                      Cash on Delivery
                    </strong>

                  </div>

                </aside>

              </div>
            )}

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;