import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="about-hero">
        <div className="about-container">
          <span className="about-eyebrow">
            ABOUT TFORTECH
          </span>

          <h1>
            Technology That
            <span> Works For You</span>
          </h1>

          <p>
            We make it easier to find reliable laptops and
            accessories that match your work, study, business,
            gaming, and everyday technology needs.
          </p>

          <div className="about-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>About</span>
          </div>
        </div>
      </section>


      {/* =====================================================
          INTRODUCTION
      ====================================================== */}

      <section className="about-intro">
        <div className="about-container about-intro-grid">

          <div className="about-intro-content">
            <span className="about-eyebrow">
              WHO WE ARE
            </span>

            <h2>
              Your trusted destination for laptops &amp;
              accessories
            </h2>

            <p>
              TForTech is focused on providing customers with
              quality laptops and useful accessories for
              different needs and budgets.
            </p>

            <p>
              Whether you are a student looking for a reliable
              laptop, a professional building a productive
              workspace, or a gamer looking for better
              performance, our goal is to make your buying
              experience simple and convenient.
            </p>

            <Link
              to="/products"
              className="about-primary-button"
            >
              Explore Products
              <span>→</span>
            </Link>
          </div>


          <div className="about-intro-visual">
            <div className="about-visual-card">

              <div className="about-visual-screen">
                <div className="about-screen-dot"></div>

                <div className="about-screen-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              <div className="about-visual-base"></div>

            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          WHAT WE OFFER
      ====================================================== */}

      <section className="about-offer">
        <div className="about-container">

          <div className="about-section-heading">
            <span className="about-eyebrow">
              WHAT WE OFFER
            </span>

            <h2>
              Everything you need for your setup
            </h2>

            <p>
              From laptops to essential accessories, we aim
              to bring useful technology products together in
              one convenient place.
            </p>
          </div>


          <div className="about-offer-grid">

            <article className="about-offer-card">
              <div className="about-offer-icon">
                💻
              </div>

              <h3>Laptops</h3>

              <p>
                Explore laptops for business, study,
                programming, everyday use, and demanding
                workloads.
              </p>
            </article>


            <article className="about-offer-card">
              <div className="about-offer-icon">
                🎮
              </div>

              <h3>Gaming</h3>

              <p>
                Discover performance-focused laptops and
                accessories designed for gaming and
                entertainment.
              </p>
            </article>


            <article className="about-offer-card">
              <div className="about-offer-icon">
                ⌨️
              </div>

              <h3>Accessories</h3>

              <p>
                Find keyboards, mice, bags, chargers,
                storage, headphones, and other useful
                accessories.
              </p>
            </article>


            <article className="about-offer-card">
              <div className="about-offer-icon">
                ✓
              </div>

              <h3>Reliable Choices</h3>

              <p>
                Product information such as condition,
                specifications, price, and availability helps
                you make an informed decision.
              </p>
            </article>

          </div>

        </div>
      </section>


      {/* =====================================================
          WHY CHOOSE US
      ====================================================== */}

      <section className="about-why">
        <div className="about-container">

          <div className="about-section-heading">
            <span className="about-eyebrow">
              WHY TFORTECH
            </span>

            <h2>
              Built around your technology needs
            </h2>

            <p>
              We want shopping for technology to feel simple,
              transparent, and convenient.
            </p>
          </div>


          <div className="about-why-grid">

            <div className="about-why-item">
              <span className="about-why-number">
                01
              </span>

              <div>
                <h3>
                  Clear Product Information
                </h3>

                <p>
                  See important product details including
                  specifications, condition, pricing, and
                  descriptions.
                </p>
              </div>
            </div>


            <div className="about-why-item">
              <span className="about-why-number">
                02
              </span>

              <div>
                <h3>
                  Multiple Brands
                </h3>

                <p>
                  Explore products from popular technology
                  brands such as HP, Dell, Lenovo, and Apple.
                </p>
              </div>
            </div>


            <div className="about-why-item">
              <span className="about-why-number">
                03
              </span>

              <div>
                <h3>
                  Different Use Cases
                </h3>

                <p>
                  Find products suitable for study, office
                  work, business, programming, gaming, and
                  everyday computing.
                </p>
              </div>
            </div>


            <div className="about-why-item">
              <span className="about-why-number">
                04
              </span>

              <div>
                <h3>
                  Customer Focused
                </h3>

                <p>
                  Our goal is to make product discovery and
                  purchasing easier for every customer.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          CONDITION / TRANSPARENCY
      ====================================================== */}

      <section className="about-transparency">
        <div className="about-container">

          <div className="about-transparency-box">

            <div>
              <span className="about-eyebrow">
                SHOP WITH CONFIDENCE
              </span>

              <h2>
                Know what you are buying
              </h2>

              <p>
                We believe customers should have access to
                useful product information before making a
                purchase. Product condition, specifications,
                pricing, stock, and descriptions can help you
                choose the right device.
              </p>
            </div>


            <div className="about-transparency-points">

              <span>
                ✓ Detailed specifications
              </span>

              <span>
                ✓ Product condition information
              </span>

              <span>
                ✓ Clear pricing
              </span>

              <span>
                ✓ Stock availability
              </span>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="about-cta">
        <div className="about-container">

          <span className="about-eyebrow">
            FIND YOUR NEXT DEVICE
          </span>

          <h2>
            Ready to explore?
          </h2>

          <p>
            Browse our products and discover laptops and
            accessories for your everyday technology needs.
          </p>

          <div className="about-cta-buttons">

            <Link
              to="/products"
              className="about-primary-button"
            >
              Shop Products
              <span>→</span>
            </Link>

            <Link
              to="/contact"
              className="about-secondary-button"
            >
              Contact Us
            </Link>

          </div>

        </div>
      </section>


      <Footer />
    </div>
  );
}

export default About;