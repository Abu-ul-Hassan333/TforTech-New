import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminReviews.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

const initialForm = {
  customer_name: "",
  review_text: "",
  rating: 5,
  is_active: true,
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] =
    useState(initialForm);
  const [videoFile, setVideoFile] =
    useState(null);

  const [editingReview, setEditingReview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  // ============================================================
  // GET CURRENT AUTH TOKEN
  // ============================================================
  //
  // Current ProtectedRoute.jsx uses:
  //   tfortech_logged_in
  //   tfortech_access_token
  //   tfortech_user_role
  //
  // We use tfortech_access_token as the primary token.
  // Legacy keys are kept as fallback so existing functionality
  // is not unnecessarily broken.
  //
  const getStoredToken = useCallback(() => {
    const currentToken =
      localStorage.getItem(
        "tfortech_access_token"
      );

    if (currentToken) {
      return currentToken;
    }

    const authToken =
      localStorage.getItem(
        "auth_token"
      );

    if (authToken) {
      return authToken;
    }

    const token =
      localStorage.getItem("token");

    if (token) {
      return token;
    }

    return null;
  }, []);

  // ============================================================
  // CHECK CURRENT ADMIN SESSION
  // ============================================================

  const getValidToken = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      return null;
    }

    try {
      await axios.get(
        `${API}/auth/me`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      return token;
    } catch (error) {
      console.error(
        "Authentication validation failed:",
        error
      );

      return null;
    }
  }, [getStoredToken]);

  // ============================================================
  // ERROR MESSAGE HELPER
  // ============================================================

  const getErrorMessage = useCallback(
    (err) => {
      return (
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    },
    []
  );

  // ============================================================
  // FETCH ADMIN REVIEWS
  // ============================================================

  const fetchReviews = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const token =
          await getValidToken();

        if (!token) {
          setReviews([]);

          setError(
            "Your authentication session is missing or expired. Please log in again."
          );

          return;
        }

        const response =
          await axios.get(
            `${API}/reviews/admin`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          response.data;

        if (Array.isArray(data)) {
          setReviews(data);
        } else if (
          Array.isArray(
            data?.reviews
          )
        ) {
          setReviews(
            data.reviews
          );
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error(
          "Failed to fetch customer reviews:",
          err
        );

        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    },
    [
      getErrorMessage,
      getValidToken,
    ]
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ============================================================
  // FORM INPUT CHANGE
  // ============================================================

  const handleInputChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };

  // ============================================================
  // VIDEO FILE CHANGE
  // ============================================================

  const handleVideoChange = (
    event
  ) => {
    const file =
      event.target.files?.[0] ||
      null;

    if (!file) {
      setVideoFile(null);
      return;
    }

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Invalid video format. Please select an MP4, WebM or MOV file."
      );

      event.target.value = "";
      setVideoFile(null);

      return;
    }

    const maxSize =
      100 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Video file is too large. Maximum allowed size is 100 MB."
      );

      event.target.value = "";
      setVideoFile(null);

      return;
    }

    setError("");
    setVideoFile(file);
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setFormData(
      initialForm
    );

    setVideoFile(null);
    setEditingReview(null);

    const input =
      document.getElementById(
        "review-video"
      );

    if (input) {
      input.value = "";
    }
  };

  // ============================================================
  // SUBMIT REVIEW
  // ============================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token =
        await getValidToken();

      if (!token) {
        setError(
          "Your authentication session is missing or expired. Please log in again."
        );

        return;
      }

      const data =
        new FormData();

      data.append(
        "customer_name",
        formData.customer_name.trim()
      );

      data.append(
        "review_text",
        formData.review_text.trim()
      );

      data.append(
        "rating",
        String(
          formData.rating
        )
      );

      data.append(
        "is_active",
        String(
          formData.is_active
        )
      );

      if (videoFile) {
        data.append(
          "video",
          videoFile
        );
      }

      // ========================================================
      // UPDATE EXISTING REVIEW
      // ========================================================

      if (editingReview) {
        await axios.put(
          `${API}/reviews/${editingReview.id}`,
          data,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setSuccess(
          "Customer review updated successfully."
        );
      }

      // ========================================================
      // CREATE NEW REVIEW
      // ========================================================

      else {
        if (!videoFile) {
          setError(
            "Please select a customer review video."
          );

          return;
        }

        await axios.post(
          `${API}/reviews`,
          data,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setSuccess(
          "Customer review uploaded successfully."
        );
      }

      resetForm();

      await fetchReviews();
    } catch (err) {
      console.error(
        "Failed to save customer review:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT REVIEW
  // ============================================================

  const handleEdit = (
    review
  ) => {
    setEditingReview(review);

    setFormData({
      customer_name:
        review.customer_name ||
        "",

      review_text:
        review.review_text ||
        "",

      rating:
        Number(
          review.rating
        ) || 5,

      is_active:
        typeof review.is_active ===
        "boolean"
          ? review.is_active
          : true,
    });

    setVideoFile(null);

    const input =
      document.getElementById(
        "review-video"
      );

    if (input) {
      input.value = "";
    }

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================================================
  // DELETE REVIEW
  // ============================================================

  const handleDelete =
    async (reviewId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this customer review and its video?"
        );

      if (!confirmed) {
        return;
      }

      setDeletingId(
        reviewId
      );

      setError("");
      setSuccess("");

      try {
        const token =
          await getValidToken();

        if (!token) {
          setError(
            "Your authentication session is missing or expired. Please log in again."
          );

          return;
        }

        await axios.delete(
          `${API}/reviews/${reviewId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setSuccess(
          "Customer review deleted successfully."
        );

        if (
          editingReview?.id ===
          reviewId
        ) {
          resetForm();
        }

        await fetchReviews();
      } catch (err) {
        console.error(
          "Failed to delete customer review:",
          err
        );

        setError(
          getErrorMessage(err)
        );
      } finally {
        setDeletingId(null);
      }
    };

  // ============================================================
  // RENDER STARS
  // ============================================================

  const renderStars = (
    rating
  ) => {
    const numericRating =
      Math.min(
        5,
        Math.max(
          0,
          Number(rating) || 0
        )
      );

    return (
      <span
        className="admin-review-stars"
        aria-label={`${numericRating} out of 5 stars`}
      >
        {"★".repeat(
          numericRating
        )}

        {"☆".repeat(
          5 - numericRating
        )}
      </span>
    );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-PK",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <AdminLayout>
      <div className="admin-reviews-page">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="admin-reviews-header">

          <div>

            <span className="admin-reviews-eyebrow">
              CUSTOMER REVIEWS
            </span>

            <h1>
              Customer Review Videos
            </h1>

            <p>
              Upload and manage
              customer review videos
              that will be displayed
              on the customer side of
              GoJuniors.
            </p>

          </div>

          <div className="admin-reviews-count">

            <strong>
              {reviews.length}
            </strong>

            <span>
              Total Reviews
            </span>

          </div>

        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="admin-reviews-alert admin-reviews-alert-error">
            {error}
          </div>
        )}

        {/* ======================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="admin-reviews-alert admin-reviews-alert-success">
            {success}
          </div>
        )}

        {/* ======================================================
            FORM
        ====================================================== */}

        <section className="admin-reviews-form-card">

          <div className="admin-reviews-card-header">

            <div>

              <h2>
                {editingReview
                  ? "Edit Customer Review"
                  : "Add Customer Review"}
              </h2>

              <p>
                Admin can upload the
                customer's review video
                and publish it on the
                website.
              </p>

            </div>

            {editingReview && (
              <button
                type="button"
                className="admin-review-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form
            className="admin-reviews-form"
            onSubmit={handleSubmit}
          >

            {/* ==================================================
                NAME + RATING
            ================================================== */}

            <div className="admin-reviews-form-grid">

              <div className="admin-review-field">

                <label htmlFor="customer-name">
                  Customer Name
                </label>

                <input
                  id="customer-name"
                  type="text"
                  name="customer_name"
                  value={
                    formData.customer_name
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter customer name"
                  required
                  disabled={saving}
                />

              </div>

              <div className="admin-review-field">

                <label htmlFor="review-rating">
                  Rating
                </label>

                <select
                  id="review-rating"
                  name="rating"
                  value={
                    formData.rating
                  }
                  onChange={
                    handleInputChange
                  }
                  disabled={saving}
                >

                  <option value="5">
                    5 Stars
                  </option>

                  <option value="4">
                    4 Stars
                  </option>

                  <option value="3">
                    3 Stars
                  </option>

                  <option value="2">
                    2 Stars
                  </option>

                  <option value="1">
                    1 Star
                  </option>

                </select>

              </div>

            </div>

            {/* ==================================================
                REVIEW TEXT
            ================================================== */}

            <div className="admin-review-field">

              <label htmlFor="review-text">
                Customer Review
              </label>

              <textarea
                id="review-text"
                name="review_text"
                value={
                  formData.review_text
                }
                onChange={
                  handleInputChange
                }
                placeholder="Enter customer's review text"
                rows="5"
                required
                disabled={saving}
              />

            </div>

            {/* ==================================================
                VIDEO
            ================================================== */}

            <div className="admin-review-field">

              <label htmlFor="review-video">
                Customer Review Video
              </label>

              <input
                id="review-video"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={
                  handleVideoChange
                }
                disabled={saving}
              />

              <small className="admin-review-help">

                Supported formats:
                MP4, WebM and MOV.
                Maximum file size:
                100 MB.

                {editingReview
                  ? " Leave empty to keep the existing video."
                  : ""}

              </small>

              {videoFile && (
                <div className="admin-review-selected-file">

                  <strong>
                    Selected video:
                  </strong>

                  {" "}

                  {videoFile.name}

                </div>
              )}

            </div>

            {/* ==================================================
                PUBLISH TOGGLE
            ================================================== */}

            <label className="admin-review-toggle">

              <input
                type="checkbox"
                name="is_active"
                checked={
                  formData.is_active
                }
                onChange={
                  handleInputChange
                }
                disabled={saving}
              />

              <span className="admin-review-toggle-ui"></span>

              <span>
                Publish this review
                on the customer
                website
              </span>

            </label>

            {/* ==================================================
                FORM BUTTONS
            ================================================== */}

            <div className="admin-reviews-form-actions">

              <button
                type="submit"
                className="admin-review-save-button"
                disabled={saving}
              >
                {saving
                  ? editingReview
                    ? "Updating..."
                    : "Uploading..."
                  : editingReview
                  ? "Update Review"
                  : "Upload Review"}
              </button>

              {editingReview && (
                <button
                  type="button"
                  className="admin-review-secondary-button"
                  onClick={
                    resetForm
                  }
                  disabled={saving}
                >
                  Reset
                </button>
              )}

            </div>

          </form>

        </section>

        {/* ======================================================
            REVIEWS LIST
        ====================================================== */}

        <section className="admin-reviews-list-section">

          <div className="admin-reviews-list-header">

            <div>

              <h2>
                Uploaded Customer Reviews
              </h2>

              <p>
                Manage the videos
                currently stored in
                the Customer Reviews
                section.
              </p>

            </div>

          </div>

          {/* ====================================================
              LOADING
          ==================================================== */}

          {loading ? (

            <div className="admin-reviews-state">

              <div className="admin-reviews-spinner"></div>

              <p>
                Loading customer
                reviews...
              </p>

            </div>

          ) : reviews.length === 0 ? (

            /* ==================================================
               EMPTY
            ================================================== */

            <div className="admin-reviews-empty">

              <div className="admin-reviews-empty-icon">
                ▶
              </div>

              <h3>
                No customer reviews yet
              </h3>

              <p>
                Upload the first
                customer review video
                using the form above.
              </p>

            </div>

          ) : (

            /* ==================================================
               GRID
            ================================================== */

            <div className="admin-reviews-grid">

              {reviews.map(
                (review) => (

                  <article
                    className="admin-review-card"
                    key={review.id}
                  >

                    {/* ========================================
                        VIDEO
                    ======================================== */}

                    <div className="admin-review-video-wrapper">

                      {review.is_active &&
                      review.video_url ? (

                        <video
                          className="admin-review-video"
                          controls
                          preload="metadata"
                        >

                          <source
                            src={
                              review.video_url
                            }
                            type="video/mp4"
                          />

                          Your browser does
                          not support video
                          playback.

                        </video>

                      ) : (

                        <div className="admin-review-video-disabled">

                          <span>
                            VIDEO
                          </span>

                          <p>
                            {review.is_active
                              ? "Video unavailable"
                              : "Review is inactive"}
                          </p>

                        </div>

                      )}

                      <span
                        className={`admin-review-status ${
                          review.is_active
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {review.is_active
                          ? "Published"
                          : "Inactive"}
                      </span>

                    </div>

                    {/* ========================================
                        CARD CONTENT
                    ======================================== */}

                    <div className="admin-review-card-content">

                      <div className="admin-review-card-top">

                        <h3>
                          {
                            review.customer_name
                          }
                        </h3>

                        {renderStars(
                          review.rating
                        )}

                      </div>

                      <p className="admin-review-card-text">
                        {
                          review.review_text
                        }
                      </p>

                      <div className="admin-review-meta">

                        <span>
                          Added:{" "}
                          {formatDate(
                            review.created_at
                          )}
                        </span>

                      </div>

                      {/* ======================================
                          ACTIONS
                      ====================================== */}

                      <div className="admin-review-card-actions">

                        <button
                          type="button"
                          className="admin-review-edit-button"
                          onClick={() =>
                            handleEdit(
                              review
                            )
                          }
                          disabled={
                            deletingId ===
                            review.id
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-review-delete-button"
                          onClick={() =>
                            handleDelete(
                              review.id
                            )
                          }
                          disabled={
                            deletingId ===
                            review.id
                          }
                        >
                          {deletingId ===
                          review.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </div>
    </AdminLayout>
  );
}