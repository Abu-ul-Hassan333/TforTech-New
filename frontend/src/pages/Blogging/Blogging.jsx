import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Blogging.css";

const articles = [
  {
    id: 1,
    category: "Laptop Buying Guide",
    title: "How to Choose the Right Laptop for Your Needs",
    description:
      "A practical guide to choosing the right laptop based on performance, storage, portability, and everyday usage.",
    date: "Laptop Guide",
    icon: "💻",
  },
  {
    id: 2,
    category: "Gaming",
    title: "What Makes a Good Gaming Laptop?",
    description:
      "Learn which specifications matter most when choosing a gaming laptop, from GPU and CPU to RAM and display.",
    date: "Gaming Guide",
    icon: "🎮",
  },
  {
    id: 3,
    category: "Technology",
    title: "SSD vs HDD: Which Storage Is Better?",
    description:
      "Understand the difference between SSD and HDD storage and find out which option is better for your laptop.",
    date: "Tech Tips",
    icon: "⚡",
  },
  {
    id: 4,
    category: "Maintenance",
    title: "Simple Ways to Keep Your Laptop Running Smoothly",
    description:
      "Follow these simple maintenance tips to improve your laptop's performance and keep it working efficiently.",
    date: "Maintenance",
    icon: "🔧",
  },
  {
    id: 5,
    category: "Accessories",
    title: "Essential Laptop Accessories You Should Consider",
    description:
      "From laptop bags and chargers to keyboards and mice, discover accessories that can make your setup better.",
    date: "Accessories",
    icon: "🖱️",
  },
  {
    id: 6,
    category: "Laptop Buying Guide",
    title: "Things to Check Before Buying a Used Laptop",
    description:
      "Buying a used laptop? Here are the important things you should inspect before making your purchase.",
    date: "Buying Guide",
    icon: "🔍",
  },
];

const blogCategories = [
  "Laptop Buying Guide",
  "Gaming",
  "Technology",
  "Maintenance",
  "Accessories",
];

function Blogging() {
  return (
    <div className="blogging-page">
      <Navbar />

      {/* HERO */}
      <section className="blogging-hero">
        <div className="blogging-hero-content">
          <span className="blogging-hero-label">TECHNOLOGY &amp; LAPTOPS</span>

          <h1>Technology Insights for Smarter Choices</h1>

          <p>
            Explore helpful laptop guides, technology tips, buying advice,
            maintenance guides, and useful information to help you make better
            technology decisions.
          </p>

          <div className="blogging-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Blogging</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="blogging-intro">
        <div className="blogging-container">
          <div className="blogging-intro-content">
            <span className="section-eyebrow">OUR BLOG</span>

            <h2>Learn Before You Buy</h2>

            <p>
              Choosing the right laptop or accessory can be confusing. Our
              articles are designed to make technology easier to understand,
              whether you are buying your first laptop, upgrading your setup,
              or looking for useful maintenance tips.
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="blogging-categories">
        <div className="blogging-container">
          <div className="blogging-section-heading">
            <div>
              <span className="section-eyebrow">EXPLORE TOPICS</span>
              <h2>Browse by Category</h2>
            </div>
          </div>

          <div className="blog-category-list">
            {blogCategories.map((category) => (
              <button type="button" key={category}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="blogging-articles">
        <div className="blogging-container">
          <div className="blogging-section-heading">
            <div>
              <span className="section-eyebrow">LATEST ARTICLES</span>
              <h2>Helpful Technology Guides</h2>
            </div>

            <p>
              Practical information to help you choose, use, and maintain your
              laptop and accessories.
            </p>
          </div>

          <div className="blog-articles-grid">
            {articles.map((article) => (
              <article className="blog-card" key={article.id}>
                <div className="blog-card-image">
                  <span className="blog-card-icon">{article.icon}</span>

                  <span className="blog-card-category">
                    {article.category}
                  </span>
                </div>

                <div className="blog-card-content">
                  <span className="blog-card-date">{article.date}</span>

                  <h3>{article.title}</h3>

                  <p>{article.description}</p>

                  <button type="button" className="read-article-button">
                    Read Article
                    <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CTA */}
      <section className="blogging-cta">
        <div className="blogging-container">
          <div className="blogging-cta-box">
            <div>
              <span className="section-eyebrow">NEED A LAPTOP?</span>

              <h2>Find the Right Technology for You</h2>

              <p>
                Explore our collection of laptops and accessories and find
                products that match your needs and budget.
              </p>
            </div>

            <Link to="/products" className="blogging-cta-button">
              Explore Products
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Blogging;