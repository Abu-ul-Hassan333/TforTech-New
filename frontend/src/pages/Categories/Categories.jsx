import React from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Categories.css";

const brandData = {
  hp: {
    name: "HP",
    title: "HP Laptops & Accessories",
    description:
      "Explore HP laptops and accessories designed for business, study, productivity, and everyday computing.",
  },

  dell: {
    name: "Dell",
    title: "Dell Laptops & Accessories",
    description:
      "Discover Dell laptops and accessories built for work, study, business, productivity, and everyday use.",
  },

  lenovo: {
    name: "Lenovo",
    title: "Lenovo Laptops & Accessories",
    description:
      "Explore Lenovo laptops and accessories offering reliable performance for work, study, business, and everyday computing.",
  },

  macbook: {
    name: "MacBook",
    title: "MacBook & Apple Accessories",
    description:
      "Explore MacBook models and compatible accessories for productivity, creative work, study, and everyday use.",
  },
};

const demoProducts = {
  hp: [
    {
      id: 1,
      name: "HP EliteBook 840 G8",
      price: "PKR 95,000",
      category: "Business Laptop",
      condition: "Used - Excellent",
      description:
        "A reliable business laptop suitable for office work, study, browsing, and productivity.",
    },
    {
      id: 2,
      name: "HP ProBook 450 G8",
      price: "PKR 82,000",
      category: "Business Laptop",
      condition: "Used - Very Good",
      description:
        "A practical HP laptop for everyday work, university tasks, browsing, and office applications.",
    },
  ],

  dell: [
    {
      id: 3,
      name: "Dell Latitude 5420",
      price: "PKR 88,000",
      category: "Business Laptop",
      condition: "Used - Excellent",
      description:
        "A dependable Dell business laptop designed for productivity, office work, and everyday use.",
    },
    {
      id: 4,
      name: "Dell Inspiron 15",
      price: "PKR 78,000",
      category: "Everyday Laptop",
      condition: "Used - Very Good",
      description:
        "A versatile Dell laptop suitable for study, browsing, entertainment, and everyday computing.",
    },
  ],

  lenovo: [
    {
      id: 5,
      name: "Lenovo ThinkPad T14",
      price: "PKR 92,000",
      category: "Business Laptop",
      condition: "Used - Excellent",
      description:
        "A professional ThinkPad designed for business, productivity, programming, and everyday work.",
    },
    {
      id: 6,
      name: "Lenovo ThinkPad X1 Carbon",
      price: "PKR 115,000",
      category: "Premium Business Laptop",
      condition: "Used - Excellent",
      description:
        "A lightweight premium business laptop ideal for professionals, students, and frequent travelers.",
    },
  ],

  macbook: [
    {
      id: 7,
      name: "MacBook Air M1",
      price: "PKR 165,000",
      category: "MacBook",
      condition: "Used - Excellent",
      description:
        "A powerful and efficient MacBook Air suitable for study, productivity, development, and creative work.",
    },
    {
      id: 8,
      name: "MacBook Pro 13",
      price: "PKR 185,000",
      category: "MacBook",
      condition: "Used - Very Good",
      description:
        "A capable MacBook Pro designed for demanding productivity and creative workloads.",
    },
  ],
};

const brandList = [
  { slug: "hp", logo: "HP", title: "HP" },
  { slug: "dell", logo: "D", title: "Dell" },
  { slug: "lenovo", logo: "L", title: "Lenovo" },
  { slug: "macbook", logo: "", title: "MacBook" },
];

function Categories() {
  const location = useLocation();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const brand = pathParts[1]?.toLowerCase() || "";

  const selectedBrand = brandData[brand];
  const products = demoProducts[brand] || [];

  if (!brand) {
    return (
      <div className="categories-page">
        <Navbar />

        <section className="categories-hero">
          <div className="categories-hero-content">
            <span className="categories-hero-label">LAPTOP BRANDS</span>

            <h1>Shop by Brand</h1>

            <p>
              Explore laptops and accessories from trusted technology brands and
              find the right product for your needs.
            </p>

            <div className="categories-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Categories</span>
            </div>
          </div>
        </section>

        <main className="categories-main">
          <div className="categories-container">
            <div className="categories-section-heading">
              <div>
                <span className="categories-eyebrow">OUR BRANDS</span>
                <h2>Choose a Brand</h2>
                <p>
                  Select a brand to explore its available laptops and accessories.
                </p>
              </div>
            </div>

            <div className="brand-grid">
              {brandList.map(({ slug, logo, title }) => (
                <Link key={slug} to={`/categories/${slug}`} className="brand-card">
                  <span className="brand-card-logo">{logo}</span>

                  <div className="brand-card-content">
                    <span className="brand-card-label">Laptop Brand</span>
                    <h3>{title}</h3>
                    <p>{brandData[slug].description}</p>
                    <span className="brand-card-link">
                      Explore {title} <span>→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!selectedBrand) {
    return (
      <div className="categories-page">
        <Navbar />

        <main className="categories-not-found">
          <div className="categories-container">
            <span className="categories-not-found-icon">404</span>
            <h1>Brand Not Found</h1>
            <p>The brand you are looking for is not available.</p>

            <Link to="/categories" className="categories-primary-button">
              View All Brands
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="categories-page">
      <Navbar />

      <section className="categories-hero">
        <div className="categories-hero-content">
          <span className="categories-hero-label">
            {selectedBrand.name.toUpperCase()}
          </span>

          <h1>{selectedBrand.title}</h1>

          <p>{selectedBrand.description}</p>

          <div className="categories-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/categories">Categories</Link>
            <span>/</span>
            <span>{selectedBrand.name}</span>
          </div>
        </div>
      </section>

      <main className="categories-main">
        <div className="categories-container">
          <div className="categories-products-heading">
            <div>
              <span className="categories-eyebrow">
                {selectedBrand.name.toUpperCase()} COLLECTION
              </span>
              <h2>{selectedBrand.name} Products</h2>
              <p>
                Browse available {selectedBrand.name} laptops and accessories.
              </p>
            </div>

            <span className="categories-product-count">{products.length} Products</span>
          </div>

          {products.length > 0 ? (
            <div className="categories-product-grid">
              {products.map((product) => (
                <article className="category-product-card" key={product.id}>
                  <div className="category-product-image-wrapper">
                    <div className="category-product-image">
                      <span className="category-product-icon">💻</span>
                      <span className="category-product-placeholder-text">
                        Product Image
                      </span>
                    </div>

                    <span className="category-product-condition">
                      {product.condition}
                    </span>
                  </div>

                  <div className="category-product-content">
                    <span className="category-product-category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>
                    <p>{product.description}</p>

                    <div className="category-product-bottom">
                      <strong>{product.price}</strong>

                      <Link
                        to={`/products/${product.id}`}
                        className="category-product-button"
                      >
                        View Description <span>→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="categories-empty">
              <h3>No products available</h3>
              <p>
                There are currently no products available under this brand.
              </p>

              <Link to="/products" className="categories-primary-button">
                View All Products
              </Link>
            </div>
          )}

          <div className="categories-all-products">
            <Link to="/products" className="categories-primary-button">
              View All Products <span>→</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Categories;
