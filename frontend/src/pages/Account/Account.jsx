import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./Account.css";


const API_URL = "http://localhost:8000";


const Account = () => {
  const navigate = useNavigate();


  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");


  // ==========================================
  // LOGOUT / AUTHENTICATION FAILURE
  // ==========================================

  const handleAuthenticationFailure = () => {
    localStorage.removeItem("tfortech_logged_in");
    localStorage.removeItem("tfortech_access_token");
    localStorage.removeItem("tfortech_token_type");
    localStorage.removeItem("tfortech_user_id");
    localStorage.removeItem("tfortech_user_name");
    localStorage.removeItem("tfortech_user_email");
    localStorage.removeItem("tfortech_user_phone");
    localStorage.removeItem("tfortech_user_role");
    localStorage.removeItem("tfortech_remember_me");

    navigate("/login");
  };


  // ==========================================
  // FETCH CURRENT USER
  // ==========================================

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem(
          "tfortech_access_token"
        );


        if (!token) {
          navigate("/login");
          return;
        }


        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );


        if (response.status === 401) {
          handleAuthenticationFailure();
          return;
        }


        if (!response.ok) {
          throw new Error(
            "Unable to load account information."
          );
        }


        const data = await response.json();


        setUser(data);


        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
        });


        // Keep Navbar user information synchronized.
        localStorage.setItem(
          "tfortech_user_id",
          data.id
        );

        localStorage.setItem(
          "tfortech_user_name",
          data.full_name
        );

        localStorage.setItem(
          "tfortech_user_email",
          data.email
        );

        localStorage.setItem(
          "tfortech_user_phone",
          data.phone
        );

        localStorage.setItem(
          "tfortech_user_role",
          data.role
        );

        localStorage.setItem(
          "tfortech_logged_in",
          "true"
        );

      } catch (fetchError) {
        console.error(
          "Account information error:",
          fetchError
        );

        setError(
          "Unable to load your account information. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };


    fetchCurrentUser();

    // handleAuthenticationFailure is intentionally
    // kept stable for this page's authentication flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);


  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;


    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));


    setError("");

    setSuccessMessage("");
  };


  // ==========================================
  // EDIT PROFILE
  // ==========================================

  const handleEdit = () => {
    if (!user) {
      return;
    }


    setFormData({
      full_name: user.full_name || "",
      phone: user.phone || "",
    });


    setIsEditing(true);

    setError("");

    setSuccessMessage("");
  };


  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
      });
    }


    setIsEditing(false);

    setError("");

    setSuccessMessage("");
  };


  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSave = async (event) => {
    event.preventDefault();


    const fullName = formData.full_name.trim();

    const phone = formData.phone.trim();


    setError("");

    setSuccessMessage("");


    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }


    if (fullName.length < 2) {
      setError(
        "Full name must contain at least 2 characters."
      );
      return;
    }


    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }


    if (phone.length < 7) {
      setError(
        "Phone number must contain at least 7 characters."
      );
      return;
    }


    try {
      setIsSaving(true);


      const token = localStorage.getItem(
        "tfortech_access_token"
      );


      if (!token) {
        handleAuthenticationFailure();
        return;
      }


      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            full_name: fullName,
            phone: phone,
          }),
        }
      );


      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to update your profile."
        );
      }


      setUser(data);


      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
      });


      // Update Navbar information immediately.
      localStorage.setItem(
        "tfortech_user_name",
        data.full_name
      );

      localStorage.setItem(
        "tfortech_user_phone",
        data.phone
      );


      setIsEditing(false);


      setSuccessMessage(
        "Your profile has been updated successfully."
      );

    } catch (saveError) {
      console.error(
        "Profile update error:",
        saveError
      );


      setError(
        saveError.message ||
          "Unable to update your profile. Please try again."
      );

    } finally {
      setIsSaving(false);
    }
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("tfortech_logged_in");
    localStorage.removeItem("tfortech_access_token");
    localStorage.removeItem("tfortech_token_type");
    localStorage.removeItem("tfortech_user_id");
    localStorage.removeItem("tfortech_user_name");
    localStorage.removeItem("tfortech_user_email");
    localStorage.removeItem("tfortech_user_phone");
    localStorage.removeItem("tfortech_user_role");
    localStorage.removeItem("tfortech_remember_me");

    navigate("/login");
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="account-page">
          <div className="account-container">

            <div className="account-header">
              <h1>My Account</h1>

              <p>
                Loading your account information...
              </p>
            </div>

          </div>
        </main>

        <Footer />
      </>
    );
  }


  // ==========================================
  // ACCOUNT LOAD ERROR
  // ==========================================

  if (error && !user) {
    return (
      <>
        <Navbar />

        <main className="account-page">
          <div className="account-container">

            <div className="account-header">
              <h1>My Account</h1>

              <p>
                {error}
              </p>
            </div>


            <div className="account-logout-card">

              <button
                type="button"
                className="account-logout-btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>

            </div>

          </div>
        </main>

        <Footer />
      </>
    );
  }


  // ==========================================
  // ACCOUNT DATA
  // ==========================================

  const userName =
    user?.full_name || "Customer";


  const userEmail =
    user?.email || "Email not available";


  const userPhone =
    user?.phone || "Phone not available";


  const accountStatus =
    user?.is_active ? "Active" : "Inactive";


  // ==========================================
  // MAIN ACCOUNT PAGE
  // ==========================================

  return (
    <>
      {/* ========================================
          HEADER / NAVBAR
      ======================================== */}

      <Navbar />


      {/* ========================================
          ACCOUNT CONTENT
      ======================================== */}

      <main className="account-page">

        <div className="account-container">

          {/* ======================================
              ACCOUNT HEADER
          ====================================== */}

          <div className="account-header">

            <h1>
              My Account
            </h1>

            <p>
              Manage your account information and
              activities.
            </p>

          </div>


          {/* ======================================
              ACCOUNT INFORMATION
          ====================================== */}

          <div className="account-card">

            <div className="account-profile-heading">

              <div>

                <h2 className="account-card-title">
                  Account Information
                </h2>

                <p className="account-profile-subtitle">
                  Your personal account details.
                </p>

              </div>


              {!isEditing && (
                <button
                  type="button"
                  className="account-edit-btn"
                  onClick={handleEdit}
                >
                  Edit Profile
                </button>
              )}

            </div>


            {/* SUCCESS MESSAGE */}

            {successMessage && (
              <div
                className="account-success-message"
                role="status"
              >
                {successMessage}
              </div>
            )}


            {/* ERROR MESSAGE */}

            {error && (
              <div
                className="account-error-message"
                role="alert"
              >
                {error}
              </div>
            )}


            {/* ==================================
                VIEW PROFILE
            ================================== */}

            {!isEditing ? (
              <>

                <div className="account-info-item">

                  <div className="account-info-label">
                    Name
                  </div>

                  <div className="account-info-value account-name">
                    {userName}
                  </div>

                </div>


                <div className="account-info-item">

                  <div className="account-info-label">
                    Email
                  </div>

                  <div className="account-info-value">
                    {userEmail}
                  </div>

                </div>


                <div className="account-info-item">

                  <div className="account-info-label">
                    Phone
                  </div>

                  <div className="account-info-value">
                    {userPhone}
                  </div>

                </div>


                <div className="account-info-item">

                  <div className="account-info-label">
                    Account Status
                  </div>

                  <span className="account-status">
                    {accountStatus}
                  </span>

                </div>

              </>
            ) : (

              /* ==================================
                 EDIT PROFILE
              ================================== */

              <form
                className="account-edit-form"
                onSubmit={handleSave}
              >

                <div className="account-form-group">

                  <label htmlFor="account-full-name">
                    Full Name
                  </label>

                  <input
                    id="account-full-name"
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={isSaving}
                  />

                </div>


                <div className="account-form-group">

                  <label htmlFor="account-email">
                    Email Address
                  </label>

                  <input
                    id="account-email"
                    type="email"
                    value={userEmail}
                    disabled
                    readOnly
                  />

                  <small>
                    Email address cannot be changed here.
                  </small>

                </div>


                <div className="account-form-group">

                  <label htmlFor="account-phone">
                    Phone Number
                  </label>

                  <input
                    id="account-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    disabled={isSaving}
                  />

                </div>


                <div className="account-edit-actions">

                  <button
                    type="button"
                    className="account-cancel-btn"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="account-save-btn"
                    disabled={isSaving}
                  >
                    {isSaving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>
            )}

          </div>


          {/* ======================================
              ACCOUNT ACTIVITIES
          ====================================== */}

          <div className="account-card">

            <h2 className="account-card-title">
              Account Activities
            </h2>


            <div className="account-activities">

              {/* WISHLIST */}

              <button
                type="button"
                className="account-activity-btn"
                onClick={() => navigate("/wishlist")}
              >

                <div className="account-activity-icon">
                  ❤️
                </div>

                <strong className="account-activity-title">
                  Wishlist
                </strong>

                <span className="account-activity-description">
                  View your saved items
                </span>

              </button>


              {/* ORDERS */}

              <button
                type="button"
                className="account-activity-btn"
                onClick={() => navigate("/orders")}
              >

                <div className="account-activity-icon">
                  📦
                </div>

                <strong className="account-activity-title">
                  Orders
                </strong>

                <span className="account-activity-description">
                  View your orders
                </span>

              </button>

            </div>

          </div>


          {/* ======================================
              LOGOUT
          ====================================== */}

          <div className="account-logout-card">

            <button
              type="button"
              className="account-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </main>


      {/* ========================================
          FOOTER
      ======================================== */}

      <Footer />
    </>
  );
};


export default Account;