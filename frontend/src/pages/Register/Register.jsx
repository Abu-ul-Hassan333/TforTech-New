import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Register.css";

const API_URL = "http://127.0.0.1:8000";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

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

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    setError("");

    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError(
        "Please agree to the Terms & Conditions and Privacy Policy."
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
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
          "Unable to create your account. Please try again.";

        if (response.status === 400) {
          setError(backendMessage);
        } else if (response.status === 422) {
          setError(
            "Please check your information and make sure all fields are valid."
          );
        } else {
          setError(backendMessage);
        }

        return;
      }

      if (!data?.success || !data?.access_token || !data?.user) {
        setError(
          "Account creation completed, but the server returned an invalid response."
        );
        return;
      }

      /*
        Save the real authentication information returned
        by the FastAPI backend.
      */
      localStorage.setItem("tfortech_logged_in", "true");
      localStorage.setItem("tfortech_access_token", data.access_token);
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

      navigate("/");
    } catch (requestError) {
      console.error("Registration request error:", requestError);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* =========================
            LEFT INFORMATION SECTION
        ========================== */}

        <div className="register-info">
          <Link to="/" className="register-logo">
            TFor Tech
          </Link>

          <div className="register-info-content">
            <span className="register-badge">
              Create Your Account
            </span>

            <h1>
              Start your
              <br />
              <span>tech journey.</span>
            </h1>

            <p>
              Create your TFor Tech account and make your shopping
              experience easier. Save products, manage orders and
              keep your favourite technology in one place.
            </p>

            <div className="register-benefits">
              <div className="register-benefit">
                <span className="register-benefit-icon">✓</span>

                <div>
                  <strong>Save Your Favorites</strong>

                  <p>
                    Add laptops and accessories to your wishlist.
                  </p>
                </div>
              </div>

              <div className="register-benefit">
                <span className="register-benefit-icon">✓</span>

                <div>
                  <strong>Easy Checkout</strong>

                  <p>
                    Keep your details ready for a faster checkout.
                  </p>
                </div>
              </div>

              <div className="register-benefit">
                <span className="register-benefit-icon">✓</span>

                <div>
                  <strong>Better Shopping</strong>

                  <p>
                    Get a smoother and more personalized experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            RIGHT REGISTER SECTION
        ========================== */}

        <div className="register-form-section">
          <div className="register-form-card">
            <div className="register-heading">
              <h2>Create account</h2>

              <p>
                Already have an account?{" "}
                <Link to="/login">Sign in</Link>
              </p>
            </div>

            {error && (
              <div className="register-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}

              <div className="register-form-group">
                <label htmlFor="register-full-name">
                  Full Name
                </label>

                <input
                  id="register-full-name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>

              {/* Email */}

              <div className="register-form-group">
                <label htmlFor="register-email">
                  Email Address
                </label>

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              {/* Phone */}

              <div className="register-form-group">
                <label htmlFor="register-phone">
                  Phone Number
                </label>

                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}

              <div className="register-form-group">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="register-password-wrapper">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
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

              {/* Confirm Password */}

              <div className="register-form-group">
                <label htmlFor="register-confirm-password">
                  Confirm Password
                </label>

                <div className="register-password-wrapper">
                  <input
                    id="register-confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Terms */}

              <label className="register-terms">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) =>
                    setAgreeTerms(event.target.checked)
                  }
                  disabled={isLoading}
                />

                <span>
                  I agree to the Terms & Conditions and Privacy
                  Policy.
                </span>
              </label>

              {/* Submit */}

              <button
                type="submit"
                className="register-submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="register-divider">
              <span>or</span>
            </div>

            <Link
              to="/"
              className="register-shopping-link"
            >
              Continue shopping
            </Link>

            <p className="register-demo-note">
              Your account is securely created using the store
              backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;