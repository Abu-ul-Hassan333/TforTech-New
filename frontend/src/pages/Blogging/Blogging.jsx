import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Blogging.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const DEFAULT_CATEGORIES = [
  "Laptop Buying Guide",
  "Gaming",
  "Technology",
  "Maintenance",
  "Accessories",
];

const CATEGORY_ICONS = {
  "Laptop Buying Guide": "💻",
  Gaming: "🎮",
  Technology: "⚡",
  Maintenance: "🔧",
  Accessories: "🖱️",
};

const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || "📝";
};

const formatPublishedDate = (value) => {
  if (!value) {
    return "Technology Guide";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Technology Guide";
  }

  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const createDescription = (blog) => {
  const excerpt = String(
    blog?.excerpt || ""
  ).trim();

  if (excerpt) {
    return excerpt;
  }

  const content = String(
    blog?.content || ""
  )
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!content) {
    return "Read this helpful technology article from GoJuniors.";
  }

  if (content.length <= 180) {
    return content;
  }

  return `${content.slice(0, 180).trim()}...`;
};

const normalizeBlog = (blog) => {
  const category =
    String(
      blog?.category ||
        "Technology"
    ).trim() ||
    "Technology";

  const tags = Array.isArray(
    blog?.tags
  )
    ? blog.tags
        .map((tag) =>
          String(tag).trim()
        )
        .filter(Boolean)
    : [];

  return {
    id:
      blog?.id ||
      blog?._id ||
      blog?.slug,

    category,

    title:
      String(
        blog?.title ||
          "Untitled Article"
      ).trim() ||
      "Untitled Article",

    description:
      createDescription(blog),

    date:
      formatPublishedDate(
        blog?.published_at ||
          blog?.created_at
      ),

    icon:
      getCategoryIcon(
        category
      ),

    image:
      typeof blog?.image ===
        "string" &&
      blog.image.trim()
        ? blog.image.trim()
        : null,

    content:
      String(
        blog?.content || ""
      ),

    author:
      String(
        blog?.author ||
          "GoJuniors"
      ).trim() ||
      "GoJuniors",

    slug:
      String(
        blog?.slug || ""
      ).trim(),

    tags,
  };
};

function Blogging() {
  const [blogs, setBlogs] =
    useState([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchBlogs =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${BACKEND_URL}/api/blogs/public`
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.detail ||
                "Unable to load blog articles."
            );
          }

          const publishedBlogs =
            Array.isArray(
              data?.blogs
            )
              ? data.blogs
                  .filter(
                    (blog) =>
                      blog?.is_published ===
                      true
                  )
                  .map(
                    normalizeBlog
                  )
                  .filter(
                    (blog) =>
                      Boolean(
                        blog.id
                      )
                  )
              : [];

          if (isMounted) {
            setBlogs(
              publishedBlogs
            );
          }
        } catch (
          requestError
        ) {
          if (isMounted) {
            setBlogs([]);
            setError(
              requestError?.message ||
                "Unable to load blog articles."
            );
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

    fetchBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const blogCategories =
    useMemo(() => {
      const categories = [
        ...DEFAULT_CATEGORIES,
      ];

      blogs.forEach(
        (blog) => {
          if (
            blog.category &&
            !categories.includes(
              blog.category
            )
          ) {
            categories.push(
              blog.category
            );
          }
        }
      );

      return categories;
    }, [blogs]);

  const filteredArticles =
    useMemo(() => {
      if (
        selectedCategory ===
        "All"
      ) {
        return blogs;
      }

      return blogs.filter(
        (blog) =>
          blog.category ===
          selectedCategory
      );
    }, [
      blogs,
      selectedCategory,
    ]);

  return (
    <div className="blogging-page">
      <Navbar />

      {/* HERO */}
      <section className="blogging-hero">
        <div className="blogging-hero-content">
          <span className="blogging-hero-label">
            TECHNOLOGY &amp; LAPTOPS
          </span>

          <h1>
            Technology Insights for Smarter Choices
          </h1>

          <p>
            Explore helpful laptop guides,
            technology tips, buying advice,
            maintenance guides, and useful
            information to help you make better
            technology decisions.
          </p>

          <div className="blogging-breadcrumb">
            <Link to="/">
              Home
            </Link>

            <span>/</span>

            <span>
              Blogging
            </span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="blogging-intro">
        <div className="blogging-container">
          <div className="blogging-intro-content">
            <span className="section-eyebrow">
              OUR BLOG
            </span>

            <h2>
              Learn Before You Buy
            </h2>

            <p>
              Choosing the right laptop or
              accessory can be confusing. Our
              articles are designed to make
              technology easier to understand,
              whether you are buying your first
              laptop, upgrading your setup, or
              looking for useful maintenance tips.
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="blogging-categories">
        <div className="blogging-container">
          <div className="blogging-section-heading">
            <div>
              <span className="section-eyebrow">
                EXPLORE TOPICS
              </span>

              <h2>
                Browse by Category
              </h2>
            </div>
          </div>

          <div className="blog-category-list">
            <button
              type="button"
              className={
                selectedCategory ===
                "All"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedCategory(
                  "All"
                )
              }
            >
              All
            </button>

            {blogCategories.map(
              (category) => (
                <button
                  type="button"
                  key={category}
                  className={
                    selectedCategory ===
                    category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                >
                  {category}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="blogging-articles">
        <div className="blogging-container">
          <div className="blogging-section-heading">
            <div>
              <span className="section-eyebrow">
                LATEST ARTICLES
              </span>

              <h2>
                Helpful Technology Guides
              </h2>
            </div>

            <p>
              Practical information to help
              you choose, use, and maintain
              your laptop and accessories.
            </p>
          </div>

          {loading ? (
            <div className="blog-articles-grid">
              <article className="blog-card">
                <div className="blog-card-image">
                  <span className="blog-card-icon">
                    ⏳
                  </span>
                </div>

                <div className="blog-card-content">
                  <span className="blog-card-date">
                    Loading...
                  </span>

                  <h3>
                    Loading latest articles
                  </h3>

                  <p>
                    Please wait while we load
                    the latest published
                    technology articles.
                  </p>
                </div>
              </article>
            </div>
          ) : error ? (
            <div className="blog-articles-grid">
              <article className="blog-card">
                <div className="blog-card-image">
                  <span className="blog-card-icon">
                    ⚠️
                  </span>
                </div>

                <div className="blog-card-content">
                  <span className="blog-card-date">
                    Blog
                  </span>

                  <h3>
                    Unable to load articles
                  </h3>

                  <p>
                    {error}
                  </p>
                </div>
              </article>
            </div>
          ) : filteredArticles.length >
            0 ? (
            <div className="blog-articles-grid">
              {filteredArticles.map(
                (article) => (
                  <article
                    className="blog-card"
                    key={article.id}
                  >
                    <div
                      className="blog-card-image"
                      style={
                        article.image
                          ? {
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.35)), url("${article.image}")`,
                              backgroundSize:
                                "cover",
                              backgroundPosition:
                                "center",
                            }
                          : undefined
                      }
                    >
                      {!article.image && (
                        <span className="blog-card-icon">
                          {article.icon}
                        </span>
                      )}

                      <span className="blog-card-category">
                        {article.category}
                      </span>
                    </div>

                    <div className="blog-card-content">
                      <span className="blog-card-date">
                        {article.date}
                      </span>

                      <h3>
                        {article.title}
                      </h3>

                      <p>
                        {article.description}
                      </p>

                      <Link
                        to={`/blogging/${article.id}`}
                        className="read-article-button"
                      >
                        Read Article
                        <span>
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="blog-articles-grid">
              <article className="blog-card">
                <div className="blog-card-image">
                  <span className="blog-card-icon">
                    📝
                  </span>
                </div>

                <div className="blog-card-content">
                  <span className="blog-card-date">
                    {selectedCategory ===
                    "All"
                      ? "Blog"
                      : selectedCategory}
                  </span>

                  <h3>
                    No published articles yet
                  </h3>

                  <p>
                    There are currently no
                    published articles in this
                    category. Please check back
                    soon for new technology guides
                    and helpful information.
                  </p>
                </div>
              </article>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED CTA */}
      <section className="blogging-cta">
        <div className="blogging-container">
          <div className="blogging-cta-box">
            <div>
              <span className="section-eyebrow">
                NEED A LAPTOP?
              </span>

              <h2>
                Find the Right Technology for You
              </h2>

              <p>
                Explore our collection of laptops
                and accessories and find products
                that match your needs and budget.
              </p>
            </div>

            <Link
              to="/products"
              className="blogging-cta-button"
            >
              Explore Products
              <span>
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Blogging;