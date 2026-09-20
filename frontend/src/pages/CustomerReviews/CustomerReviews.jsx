import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaPlay } from "react-icons/fa";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./CustomerReviews.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API}/reviews`);

        const data = response.data;

        if (Array.isArray(data)) {
          setReviews(data);
        } else if (Array.isArray(data?.reviews)) {
          setReviews(data.reviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Failed to load customer reviews:", err);

        setError(
          err?.response?.data?.detail ||
            "Customer reviews could not be loaded right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    const numericRating = Math.min(
      5,
      Math.max(0, Number(rating) || 0)
    );

    return (
      <div
        className="customer-reviews-stars"
        aria-label={`${numericRating} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, index) =>
          index < numericRating ? (
            <FaStar key={index} />
          ) : (
            <FaRegStar key={index} />
          )
        )}
      </div>
    );
  };

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="customer-reviews-page">
      <Navbar />

      <main>
        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="customer-reviews-hero">
          <div className="customer-reviews-container">
            <span className="customer-reviews-eyebrow">
              CUSTOMER REVIEWS
            </span>

            <h1>What Our Customers Say</h1>

            <p>
              Watch real customer experiences and see what families
              think about shopping with GoJuniors.
            </p>
          </div>
        </section>

        {/* =====================================================
            REVIEWS
            ===================================================== */}

        <section className="customer-reviews-section">
          <div className="customer-reviews-container">
            <div className="customer-reviews-heading">
              <span>REAL EXPERIENCES</span>

              <h2>Hear It From Our Customers</h2>

              <p>
                Genuine feedback from customers who have experienced
                GoJuniors products and service.
              </p>
            </div>

            {loading ? (
              <div className="customer-reviews-state">
                <div className="customer-reviews-spinner"></div>

                <p>Loading customer reviews...</p>
              </div>
            ) : error ? (
              <div className="customer-reviews-state customer-reviews-error">
                <div className="customer-reviews-error-icon">
                  !
                </div>

                <h3>Unable to load reviews</h3>

                <p>{error}</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="customer-reviews-state">
                <div className="customer-reviews-empty-icon">
                  <FaPlay />
                </div>

                <h3>No customer reviews yet</h3>

                <p>
                  Customer review videos will appear here once they
                  are published.
                </p>
              </div>
            ) : (
              <div className="customer-reviews-grid">
                {reviews.map((review) => (
                  <article
                    className="customer-review-card"
                    key={review.id}
                  >
                    <div className="customer-review-video-wrapper">
                      {review.video_url ? (
                        <video
                          className="customer-review-video"
                          controls
                          preload="metadata"
                          playsInline
                        >
                          <source src={review.video_url} />

                          Your browser does not support video
                          playback.
                        </video>
                      ) : (
                        <div className="customer-review-video-unavailable">
                          <FaPlay />
                          <span>Video unavailable</span>
                        </div>
                      )}

                      <div className="customer-review-video-badge">
                        <FaPlay />
                        <span>Customer Story</span>
                      </div>
                    </div>

                    <div className="customer-review-content">
                      <div className="customer-review-top">
                        <div>
                          <h3>{review.customer_name}</h3>

                          <span className="customer-review-verified">
                            Verified Customer
                          </span>
                        </div>

                        {renderStars(review.rating)}
                      </div>

                      <p className="customer-review-text">
                        "{review.review_text}"
                      </p>

                      {review.created_at && (
                        <div className="customer-review-date">
                          {formatDate(review.created_at)}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            CTA
            ===================================================== */}

        {!loading && !error && reviews.length > 0 && (
          <section className="customer-reviews-cta">
            <div className="customer-reviews-container">
              <div className="customer-reviews-cta-content">
                <span className="customer-reviews-cta-label">
                  THANK YOU
                </span>

                <h2>We're Happy To Have You With Us</h2>

                <p>
                  Your trust and support mean a lot to the GoJuniors
                  family.
                </p>

                <a href="/shop" className="customer-reviews-cta-button">
                  Explore Our Store
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerReviews;