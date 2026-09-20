import React from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";

import "./Footer.css";


function Footer() {
  const location = useLocation();

  const {
    theme,
  } = useTheme();


  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
  };


  const isAdminPage =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");


  const showFooter =
    isAdminPage ||
    theme.show_footer !== false;


  const siteName =
    theme.site_name ||
    "GoJuniors";


  if (!showFooter) {
    return null;
  }


  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* =====================================================
            FOOTER TOP
        ====================================================== */}

        <div className="footer-top">

          {/* ===================================================
              BRAND
          =================================================== */}

          <div className="footer-brand">

            <Link
              to="/"
              className="footer-logo"
            >
              {siteName}
            </Link>


            <p className="footer-description">
              Discover comfortable clothing, playful toys and accessories
              made for curious minds and growing hearts.
            </p>


            <div className="footer-socials">

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                Instagram
              </a>


              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                Facebook
              </a>


              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                TikTok
              </a>

            </div>

          </div>


          {/* ===================================================
              SHOP
          =================================================== */}

          <div className="footer-column">

            <h3>
              Shop
            </h3>


            <Link to="/shop">
              All Products
            </Link>

            <Link to="/categories">
              Categories
            </Link>

            <Link to="/shop">
              New Arrivals
            </Link>

            <Link to="/shop">
              Bestsellers
            </Link>

            <Link to="/shop">
              On Sale
            </Link>

          </div>


          {/* ===================================================
              HELP
          =================================================== */}

          <div className="footer-column">

            <h3>
              Help
            </h3>


            <Link to="/shipping">
              Shipping Information
            </Link>

            <Link to="/returns">
              Returns &amp; Exchanges
            </Link>

            <Link to="/faq">
              FAQs
            </Link>

            <Link to="/contact">
              Contact Us
            </Link>

          </div>


          {/* ===================================================
              COMPANY
          =================================================== */}

          <div className="footer-column">

            <h3>
              Company
            </h3>


            <Link to="/about">
              About Us
            </Link>

            <Link to="/contact">
              Contact
            </Link>

            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/terms">
              Terms &amp; Conditions
            </Link>

          </div>


          {/* ===================================================
              NEWSLETTER
          =================================================== */}

          <div className="footer-newsletter">

            <h3>
              Stay in the loop
            </h3>


            <p>
              Subscribe for new arrivals, special offers and updates.
            </p>


            <form
              className="newsletter-form"
              onSubmit={handleNewsletterSubmit}
            >

              <input
                type="email"
                placeholder="Your email address"
                aria-label="Your email address"
                required
              />


              <button type="submit">
                Subscribe
              </button>

            </form>

          </div>

        </div>


        {/* =====================================================
            DELIVERY STRIP
        ====================================================== */}

        <div className="footer-delivery">

          <div className="footer-delivery-item">

            <span className="footer-delivery-icon">
              ✓
            </span>

            <div>
              <strong>
                Quality Products
              </strong>

              <span>
                Carefully selected for kids
              </span>
            </div>

          </div>


          <div className="footer-delivery-item">

            <span className="footer-delivery-icon">
              🚚
            </span>

            <div>
              <strong>
                Free Shipping
              </strong>

              <span>
                On orders over PKR 5,000
              </span>
            </div>

          </div>


          <div className="footer-delivery-item">

            <span className="footer-delivery-icon">
              ↩
            </span>

            <div>
              <strong>
                Easy Returns
              </strong>

              <span>
                Simple return process
              </span>
            </div>

          </div>

        </div>


        {/* =====================================================
            FOOTER BOTTOM
        ====================================================== */}

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>


          <div className="footer-legal-links">

            <Link to="/privacy">
              Privacy
            </Link>

            <Link to="/terms">
              Terms
            </Link>

            <Link to="/contact">
              Contact
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}


export default Footer;