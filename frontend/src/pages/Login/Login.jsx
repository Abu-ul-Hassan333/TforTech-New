import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Login.css";

const API_URL = "http://127.0.0.1:8000";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      let data = null;

      try {
        data = await response.json();
      } catch (jsonError) {
        data = null;
      }

      if (!response.ok) {
        const backendMessage =
          data?.detail ||
          data?.message ||
          "Unable to sign in. Please check your email and password.";

        if (response.status === 401) {
          setError("Invalid email or password.");
        } else if (response.status === 403) {
          setError(
            backendMessage ||
              "Your account has been disabled."
          );
        } else if (response.status === 422) {
          setError(
            "Please check your email and password and try again."
          );
        } else {
          setError(backendMessage);
        }

        return;
      }

      if (
        !data?.success ||
        !data?.access_token ||
        !data?.user
      ) {
        setError(
          "Login completed, but the server returned an invalid response."
        );
        return;
      }

      /*
        Save authentication information locally.

        The JWT token will be used later when we connect
        protected pages and admin functionality.
      */
      localStorage.setItem("tfortech_logged_in", "true");

      localStorage.setItem(
        "tfortech_access_token",
        data.access_token
      );

      localStorage.setItem(
        "tfortech_token_type",
        data.token_type || "bearer"
      );

      localStorage.setItem(
        "tfortech_user_id",
        data.user.id
      );

      localStorage.setItem(
        "tfortech_user_name",
        data.user.full_name
      );

      localStorage.setItem(
        "tfortech_user_email",
        data.user.email
      );

      localStorage.setItem(
        "tfortech_user_phone",
        data.user.phone
      );

      localStorage.setItem(
        "tfortech_user_role",
        data.user.role
      );

      /*
        Remember Me is kept for future session handling.

        For now, authentication information is stored in
        localStorage so the current frontend can use it.
      */
      localStorage.setItem(
        "tfortech_remember_me",
        rememberMe ? "true" : "false"
      );

      navigate("/");
    } catch (requestError) {
      console.error("Login request error:", requestError);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setError(
      "Password reset will be connected in the next authentication stage."
    );
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left Side */}
        <div className="login-info">
          <Link to="/" className="login-logo">
            TFor Tech
          </Link>

          <div className="login-info-content">
            <span className="login-badge">
              Welcome Back
            </span>

            <h1>
              Your technology
              <br />
              <span>starts here.</span>
            </h1>

            <p>
              Sign in to manage your account, track your orders,
              save products to your wishlist, and enjoy a smoother
              shopping experience.
            </p>

            <div className="login-benefits">
              <div className="login-benefit">
                <span className="login-benefit-icon">
                  ✓
                </span>

                <div>
                  <strong>Easy Shopping</strong>

                  <p>
                    Quickly access your saved products and orders.
                  </p>
                </div>
              </div>

              <div className="login-benefit">
                <span className="login-benefit-icon">
                  ✓
                </span>

                <div>
                  <strong>Wishlist</strong>

                  <p>
                    Keep your favourite laptops and accessories saved.
                  </p>
                </div>
              </div>

              <div className="login-benefit">
                <span className="login-benefit-icon">
                  ✓
                </span>

                <div>
                  <strong>Secure Account</strong>

                  <p>
                    Your account information stays protected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-form-section">
          <div className="login-form-card">

            <div className="login-heading">
              <h2>
                Sign in
              </h2>

              <p>
                Don't have an account?{" "}
                <Link to="/register">
                  Create one
                </Link>
              </p>
            </div>

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="login-form-group">
                <label htmlFor="login-email">
                  Email Address
                </label>

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div className="login-form-group">
                <div className="login-password-label">
                  <label htmlFor="login-password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password-button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="login-password-wrapper">
                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={isLoading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  disabled={isLoading}
                />

                <span>
                  Remember me
                </span>
              </label>

              <button
                type="submit"
                className="login-submit-button"
                disabled={isLoading}
              >
                {isLoading
                  ? "Signing In..."
                  : "Sign In"}
              </button>
            </form>

            <div className="login-divider">
              <span>
                or
              </span>
            </div>

            <Link
              to="/"
              className="continue-shopping-link"
            >
              Continue shopping
            </Link>

            <p className="login-demo-note">
              Your account is securely authenticated using
              the store backend.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;