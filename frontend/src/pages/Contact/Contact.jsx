import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">
      <Navbar />

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="contact-hero">
        <div className="contact-container">
          <span className="contact-eyebrow">GET IN TOUCH</span>

          <h1>
            We&apos;re Here
            <span>To Help You</span>
          </h1>

          <p>
            Have a question about a laptop, accessory, order, or
            anything else? Get in touch with our team and we&apos;ll
            be happy to help.
          </p>

          <div className="contact-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Contact</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT CONTENT
          ===================================================== */}

      <main className="contact-main">
        <div className="contact-container">
          <div className="contact-grid">

            {/* LEFT SIDE */}

            <div className="contact-info">
              <span className="contact-eyebrow">
                CONTACT INFORMATION
              </span>

              <h2>
                Let&apos;s talk about
                <span>technology</span>
              </h2>

              <p className="contact-info-intro">
                Whether you need help choosing the right laptop,
                want more information about a product, or have a
                question about your order, feel free to contact us.
              </p>

              <div className="contact-info-list">

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 5.5C4 4.67 4.67 4 5.5 4H8L10 8.5L7.8 9.8C8.9 12.1 11 14.2 13.3 15.2L14.5 13L19 15V18.5C19 19.33 18.33 20 17.5 20C10.04 20 4 13.96 4 6.5V5.5Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>+92 300 0000000</strong>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3.5"
                        y="5"
                        width="17"
                        height="14"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />

                      <path
                        d="M4.5 7L12 13L19.5 7"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>support@tfortech.com</strong>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 21C16.2 16.2 19 12.9 19 9.5C19 5.91 15.87 3 12 3C8.13 3 5 5.91 5 9.5C5 12.9 7.8 16.2 12 21Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />

                      <circle
                        cx="12"
                        cy="9.5"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>Pakistan</strong>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="8.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />

                      <path
                        d="M12 7V12L15 14"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <span>Support Hours</span>
                    <strong>Mon - Sat, 10 AM - 7 PM</strong>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE — FORM */}

            <div className="contact-form-wrapper">
              <div className="contact-form-header">
                <span className="contact-eyebrow">
                  SEND A MESSAGE
                </span>

                <h2>How can we help?</h2>

                <p>
                  Fill out the form below and our team will get
                  back to you.
                </p>
              </div>

              {submitted && (
                <div className="contact-success-message">
                  <span>✓</span>

                  <div>
                    <strong>Message received</strong>

                    <p>
                      Thank you for contacting us. We&apos;ll get
                      back to you as soon as possible.
                    </p>
                  </div>
                </div>
              )}

              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >
                <div className="contact-form-row">

                  <div className="contact-field">
                    <label htmlFor="name">
                      Your Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="email">
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>

                <div className="contact-field">
                  <label htmlFor="subject">
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="What can we help you with?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="message">
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="contact-submit-button"
                >
                  Send Message
                  <span>→</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          FAQ / HELP STRIP
          ===================================================== */}

      <section className="contact-help">
        <div className="contact-container">
          <div className="contact-help-content">
            <div>
              <span className="contact-eyebrow">
                NEED QUICK HELP?
              </span>

              <h2>
                Looking for a product?
              </h2>

              <p>
                Browse our available laptops and accessories or
                explore products by brand and category.
              </p>
            </div>

            <div className="contact-help-buttons">
              <Link
                to="/products"
                className="contact-primary-button"
              >
                Browse Products
                <span>→</span>
              </Link>

              <Link
                to="/categories"
                className="contact-secondary-button"
              >
                View Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;