import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";

import Navbar from "../../components/Navbar/Navbar";

import Footer from "../../components/Footer/Footer";

import "./Checkout.css";


const API_URL = "http://127.0.0.1:8000";


function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    totalItems,
    subtotal,
    delivery,
    grandTotal,
    clearCart,
  } = useCart();


  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });


  const [errors, setErrors] = useState({});

  const [orderPlaced, setOrderPlaced] = useState(false);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [orderError, setOrderError] = useState("");

  const [orderId, setOrderId] = useState("");


  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setOrderError("");
  };


  // ==========================================
  // VALIDATE FORM
  // ==========================================

  const validateForm = () => {
    const newErrors = {};


    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }


    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = "Please enter a valid phone number.";
    }


    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }


    if (!formData.address.trim()) {
      newErrors.address = "Please enter your complete address.";
    }


    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city.";
    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  // ==========================================
  // PLACE ORDER
  // ==========================================

  const handlePlaceOrder = async (event) => {
    if (event) {
      event.preventDefault();
    }


    if (cartItems.length === 0) {
      return;
    }


    const isValid = validateForm();

    if (!isValid) {
      return;
    }


    setOrderError("");

    setIsPlacingOrder(true);


    try {
      const token = localStorage.getItem(
        "tfortech_access_token"
      );


      // User must be logged in before placing an order.
      if (!token) {
        navigate("/login");
        return;
      }


      // Convert cart items into the structure
      // expected by the FastAPI Orders API.
      const orderItems = cartItems.map((item) => {
        const productId = String(
          item.id || item._id || ""
        );


        return {
          product_id: productId,
          product_name: item.name || "Product",
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
          image: item.image || null,
        };
      });


      // Combine address + city because the backend
      // stores the complete shipping address together.
      const shippingAddress =
        `${formData.address.trim()}, ${formData.city.trim()}`;


      const response = await fetch(
        `${API_URL}/api/auth/orders`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            items: orderItems,
            shipping_address: shippingAddress,
            phone: formData.phone.trim(),
            payment_method: "Cash on Delivery",
          }),
        }
      );


      // Authentication problem
      if (response.status === 401) {
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

        return;
      }


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to place your order. Please try again."
        );
      }


      // Save returned order ID for the success screen.
      setOrderId(data.id || "");


      // Only clear the cart AFTER the backend
      // confirms that the order was successfully created.
      clearCart();


      setOrderPlaced(true);
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );


      setOrderError(
        error.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };


  // ==========================================
  // EMPTY CART
  // ==========================================

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <>
        <Navbar />

        <main className="checkout-page">
          <section className="checkout-empty">
            <div className="checkout-empty-inner">

              <div className="checkout-empty-icon">
                🛒
              </div>

              <h1>
                Your Cart Is Empty
              </h1>

              <p>
                You need to add at least one product
                to your cart before proceeding to
                checkout.
              </p>

              <Link
                to="/products"
                className="checkout-primary-button"
              >
                Browse Products
              </Link>

            </div>
          </section>
        </main>

        <Footer />
      </>
    );
  }


  // ==========================================
  // ORDER SUCCESS
  // ==========================================

  if (orderPlaced) {
    return (
      <>
        <Navbar />

        <main className="checkout-page">
          <section className="checkout-success">

            <div className="checkout-success-card">

              <div className="checkout-success-icon">
                ✓
              </div>

              <span className="checkout-success-label">
                Order Confirmed
              </span>

              <h1>
                Thank You for Your Order!
              </h1>

              <p>
                Your order has been successfully
                placed. Our team will contact you
                shortly to confirm your order and
                delivery details.
              </p>


              {orderId && (
                <p>
                  <strong>
                    Order ID:
                  </strong>{" "}
                  {orderId}
                </p>
              )}


              <div className="checkout-success-actions">

                <Link
                  to="/products"
                  className="checkout-primary-button"
                >
                  Continue Shopping
                </Link>

                <Link
                  to="/account"
                  className="checkout-secondary-button"
                >
                  View My Account
                </Link>

                <Link
                  to="/"
                  className="checkout-secondary-button"
                >
                  Back to Home
                </Link>

              </div>

            </div>

          </section>
        </main>

        <Footer />
      </>
    );
  }


  // ==========================================
  // MAIN CHECKOUT
  // ==========================================

  return (
    <>
      <Navbar />

      <main className="checkout-page">

        {/* ==========================================
            CHECKOUT HERO
        ========================================== */}

        <section className="checkout-hero">
          <div className="checkout-container">

            <span className="checkout-eyebrow">
              SECURE CHECKOUT
            </span>

            <h1>
              Complete Your Order
            </h1>

            <p>
              Enter your delivery information and
              review your order before placing it.
            </p>

          </div>
        </section>


        {/* ==========================================
            CHECKOUT CONTENT
        ========================================== */}

        <section className="checkout-section">

          <div className="checkout-container checkout-layout">

            {/* ==========================================
                CUSTOMER INFORMATION
            ========================================== */}

            <div className="checkout-form-card">

              <div className="checkout-card-heading">

                <span className="checkout-step-number">
                  01
                </span>

                <div>

                  <h2>
                    Customer Information
                  </h2>

                  <p>
                    Enter your details for order
                    delivery.
                  </p>

                </div>

              </div>


              <form onSubmit={handlePlaceOrder}>

                {/* FULL NAME */}

                <div className="checkout-form-group">

                  <label htmlFor="fullName">
                    Full Name
                    <span>*</span>
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={
                      errors.fullName
                        ? "checkout-input checkout-input-error"
                        : "checkout-input"
                    }
                    disabled={isPlacingOrder}
                  />

                  {errors.fullName && (
                    <small className="checkout-error">
                      {errors.fullName}
                    </small>
                  )}

                </div>


                {/* PHONE + EMAIL */}

                <div className="checkout-form-row">

                  <div className="checkout-form-group">

                    <label htmlFor="phone">
                      Phone Number
                      <span>*</span>
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="03XX XXXXXXX"
                      className={
                        errors.phone
                          ? "checkout-input checkout-input-error"
                          : "checkout-input"
                      }
                      disabled={isPlacingOrder}
                    />

                    {errors.phone && (
                      <small className="checkout-error">
                        {errors.phone}
                      </small>
                    )}

                  </div>


                  <div className="checkout-form-group">

                    <label htmlFor="email">
                      Email Address
                      <span>*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={
                        errors.email
                          ? "checkout-input checkout-input-error"
                          : "checkout-input"
                      }
                      disabled={isPlacingOrder}
                    />

                    {errors.email && (
                      <small className="checkout-error">
                        {errors.email}
                      </small>
                    )}

                  </div>

                </div>


                {/* ADDRESS */}

                <div className="checkout-form-group">

                  <label htmlFor="address">
                    Complete Address
                    <span>*</span>
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Flat number, street, area..."
                    rows="4"
                    className={
                      errors.address
                        ? "checkout-input checkout-textarea checkout-input-error"
                        : "checkout-input checkout-textarea"
                    }
                    disabled={isPlacingOrder}
                  />

                  {errors.address && (
                    <small className="checkout-error">
                      {errors.address}
                    </small>
                  )}

                </div>


                {/* CITY */}

                <div className="checkout-form-group">

                  <label htmlFor="city">
                    City
                    <span>*</span>
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className={
                      errors.city
                        ? "checkout-input checkout-input-error"
                        : "checkout-input"
                    }
                    disabled={isPlacingOrder}
                  />

                  {errors.city && (
                    <small className="checkout-error">
                      {errors.city}
                    </small>
                  )}

                </div>


                {/* PAYMENT INFO */}

                <div className="checkout-payment-note">

                  <div className="checkout-payment-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      Cash on Delivery
                    </strong>

                    <p>
                      Payment method will be confirmed
                      during order confirmation.
                    </p>

                  </div>

                </div>


                {/* BACKEND ERROR */}

                {orderError && (
                  <div
                    className="checkout-error"
                    style={{
                      marginTop: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    {orderError}
                  </div>
                )}


                {/* PLACE ORDER MOBILE/FORM BUTTON */}

                <button
                  type="submit"
                  className="checkout-place-order-mobile"
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder
                    ? "Placing Order..."
                    : `Place Order — PKR ${grandTotal.toLocaleString()}`}
                </button>

              </form>

            </div>


            {/* ==========================================
                ORDER SUMMARY
            ========================================== */}

            <aside className="checkout-summary-card">

              <div className="checkout-summary-heading">

                <div>

                  <span className="checkout-summary-label">
                    YOUR ORDER
                  </span>

                  <h2>
                    Order Summary
                  </h2>

                </div>

                <span className="checkout-item-count">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </span>

              </div>


              {/* PRODUCTS */}

              <div className="checkout-products">

                {cartItems.map((item) => {

                  const productId =
                    item.id || item._id;

                  return (
                    <div
                      className="checkout-product"
                      key={productId}
                    >

                      <div className="checkout-product-image">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <div className="checkout-product-placeholder">
                            Laptop
                          </div>
                        )}

                      </div>


                      <div className="checkout-product-info">

                        <Link
                          to={`/products/${productId}`}
                          className="checkout-product-name"
                        >
                          {item.name}
                        </Link>

                        <div className="checkout-product-meta">
                          Qty: {item.quantity}
                        </div>

                        <div className="checkout-product-price">
                          PKR{" "}
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 0)
                          ).toLocaleString()}
                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>


              {/* TOTALS */}

              <div className="checkout-summary-divider">
              </div>


              <div className="checkout-total-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  PKR {subtotal.toLocaleString()}
                </strong>

              </div>


              <div className="checkout-total-row">

                <span>
                  Delivery
                </span>

                <strong>
                  {delivery === 0
                    ? "FREE"
                    : `PKR ${delivery.toLocaleString()}`}
                </strong>

              </div>


              {delivery === 0 && (
                <div className="checkout-free-delivery">
                  ✓ Free delivery applied
                </div>
              )}


              <div className="checkout-summary-divider">
              </div>


              <div className="checkout-grand-total">

                <span>
                  Total
                </span>

                <strong>
                  PKR {grandTotal.toLocaleString()}
                </strong>

              </div>


              {/* DESKTOP PLACE ORDER BUTTON */}

              <button
                type="button"
                className="checkout-place-order-button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder
                  ? "Placing Order..."
                  : "Place Order"}
              </button>


              <p className="checkout-security-note">
                Your order information is kept secure
                and will only be used for order
                processing.
              </p>


              <Link
                to="/cart"
                className="checkout-back-cart"
              >
                ← Back to Cart
              </Link>

            </aside>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}


export default Checkout;