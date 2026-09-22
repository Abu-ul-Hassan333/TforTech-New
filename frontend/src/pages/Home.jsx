import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import "./Home.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

const categories = [
  {
    title: "Laptops",
    description:
      "Reliable laptops for work, study and everyday use.",
    icon: "💻",
  },
  {
    title: "Gaming Laptops",
    description:
      "Powerful machines built for gaming and performance.",
    icon: "🎮",
  },
  {
    title: "MacBooks",
    description:
      "Premium Apple laptops for work and creativity.",
    icon: "",
  },
  {
    title: "Laptop Accessories",
    description:
      "Everything you need to complete your setup.",
    icon: "🎒",
  },
];

const benefits = [
  {
    icon: "✓",
    title: "Quality Products",
    description:
      "Carefully selected laptops and accessories with quality in mind.",
  },
  {
    icon: "↻",
    title: "Easy Returns",
    description:
      "A simple return process designed to give you complete peace of mind.",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    description:
      "Get your products delivered safely and conveniently across Pakistan.",
  },
];

const testimonials = [
  {
    name: "Ahmed Khan",
    text:
      "The laptop arrived exactly as described. The quality and packaging were excellent.",
    rating: 5,
  },
  {
    name: "Hassan Ali",
    text:
      "Very good shopping experience. I found the laptop I needed at a reasonable price.",
    rating: 5,
  },
  {
    name: "Usman Ahmed",
    text:
      "The product quality was great and delivery was quick. Highly recommended.",
    rating: 5,
  },
];

const DEFAULT_HERO = {
  enabled: true,
  badge: "PREMIUM LAPTOPS & ACCESSORIES",
  title: "Technology That Fits Your World",
  description:
    "Discover reliable laptops, gaming machines and essential accessories for work, study, gaming and everyday life.",
  primary_button_text: "View Products",
  primary_button_link: "/products",
  secondary_button_text: "Explore Categories",
  secondary_button_link: "/categories",
  image: "",
  video_enabled: false,
  video: "",
  overlay_opacity: 0.78,
  image_position: "center",
};

const formatPrice = (price) => {
  return `PKR ${Number(price || 0).toLocaleString("en-PK")}`;
};

const getProductId = (product) => {
  return (
    product?.product_id ||
    product?.id ||
    product?._id ||
    null
  );
};

const getProductImages = (product) => {
  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    return product.images.filter(Boolean);
  }

  if (
    Array.isArray(product?.image_urls) &&
    product.image_urls.length > 0
  ) {
    return product.image_urls.filter(Boolean);
  }

  if (product?.image) {
    return [product.image];
  }

  if (product?.image_url) {
    return [product.image_url];
  }

  return [];
};

const getImageUrl = (product) => {
  const images =
    getProductImages(product);

  const image =
    images.length > 0
      ? images[0]
      : "";

  if (!image) {
    return "";
  }

  const imageString =
    String(image).trim();

  if (
    imageString.startsWith("http://") ||
    imageString.startsWith("https://") ||
    imageString.startsWith("data:") ||
    imageString.startsWith("blob:")
  ) {
    return imageString;
  }

  return `${BACKEND_URL}${
    imageString.startsWith("/")
      ? ""
      : "/"
  }${imageString}`;
};

const getHeroMediaUrl = (media) => {
  if (!media) {
    return "";
  }

  const mediaString =
    String(media).trim();

  if (
    mediaString.startsWith("http://") ||
    mediaString.startsWith("https://") ||
    mediaString.startsWith("data:") ||
    mediaString.startsWith("blob:")
  ) {
    return mediaString;
  }

  return `${BACKEND_URL}${
    mediaString.startsWith("/")
      ? ""
      : "/"
  }${mediaString}`;
};

const getDisplayedPrice = (product) => {
  const originalPrice =
    Number(product?.price || 0);

  const discountPrice =
    Number(product?.discount_price);

  if (
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < originalPrice
  ) {
    return discountPrice;
  }

  return originalPrice;
};

const getOriginalPrice = (product) => {
  const originalPrice =
    Number(product?.price || 0);

  const discountPrice =
    Number(product?.discount_price);

  if (
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < originalPrice
  ) {
    return originalPrice;
  }

  return null;
};

function HeroSection() {
  const [hero, setHero] = useState({
    ...DEFAULT_HERO,
  });

  const [heroLoading, setHeroLoading] =
    useState(true);

  const [heroMedia, setHeroMedia] =
    useState("image");

  const [heroVideoError, setHeroVideoError] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchHero = async () => {
      try {
        setHeroLoading(true);

        const response = await fetch(
          `${API}/hero/public`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Hero request failed with status ${response.status}`
          );
        }

        const data =
          await response.json();

        if (!isMounted) {
          return;
        }

        const loadedHero = {
          ...DEFAULT_HERO,
          ...(data?.hero || {}),
        };

        setHero(loadedHero);
        setHeroVideoError(false);

        if (
          loadedHero.video_enabled &&
          loadedHero.video
        ) {
          setHeroMedia("video");
        } else {
          setHeroMedia("image");
        }
      } catch (error) {
        console.error(
          "Error loading Hero:",
          error
        );

        if (isMounted) {
          setHero({
            ...DEFAULT_HERO,
          });

          setHeroMedia("image");
        }
      } finally {
        if (isMounted) {
          setHeroLoading(false);
        }
      }
    };

    fetchHero();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeroVideoEnded = () => {
    setHeroMedia("image");
  };

  const handleHeroVideoError = () => {
    setHeroVideoError(true);
    setHeroMedia("image");
  };

  const heroImageUrl =
    getHeroMediaUrl(
      hero.image
    );

  const heroVideoUrl =
    getHeroMediaUrl(
      hero.video
    );

  if (
    !heroLoading &&
    hero.enabled === false
  ) {
    return null;
  }

  const heroMediaStyle = {
    objectPosition:
      hero.image_position || "center",
  };

  const heroOverlayStyle = {
    opacity:
      Number.isFinite(
        Number(
          hero.overlay_opacity
        )
      )
        ? Number(
            hero.overlay_opacity
          )
        : 0.78,
  };

  return (
    <section className="hero-section">
      {heroMedia === "video" &&
        heroVideoUrl &&
        !heroVideoError && (
          <video
            className="hero-background-video"
            src={heroVideoUrl}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={
              handleHeroVideoEnded
            }
            onError={
              handleHeroVideoError
            }
          />
        )}

      {heroMedia === "image" &&
        heroImageUrl && (
          <img
            className="hero-background-image"
            src={heroImageUrl}
            alt=""
            style={
              heroMediaStyle
            }
          />
        )}

      {heroMedia === "image" &&
        !heroImageUrl && (
          <div className="hero-background-fallback" />
        )}

      <div
        className="hero-background-overlay"
        style={
          heroOverlayStyle
        }
      />

      <div className="hero-overlay">
        <div className="hero-content">
          {hero.badge && (
            <span className="hero-badge">
              {hero.badge}
            </span>
          )}

          <h1>
            {hero.title}
          </h1>

          <p>
            {hero.description}
          </p>

          <div className="hero-buttons">
            {hero.primary_button_text &&
              hero.primary_button_link && (
                <a
                  href={
                    hero.primary_button_link
                  }
                  className="primary-button"
                >
                  {
                    hero.primary_button_text
                  }
                </a>
              )}

            {hero.secondary_button_text &&
              hero.secondary_button_link && (
                <a
                  href={
                    hero.secondary_button_link
                  }
                  className="secondary-button"
                >
                  {
                    hero.secondary_button_text
                  }
                </a>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PopularProductImage({
  product,
}) {
  const [imageError, setImageError] =
    useState(false);

  const imageUrl =
    getImageUrl(product);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  if (
    imageUrl &&
    !imageError
  ) {
    return (
      <img
        src={imageUrl}
        alt={
          product?.name ||
          "Product"
        }
        className="product-card-image"
        onError={() =>
          setImageError(true)
        }
      />
    );
  }

  return (
    <span className="product-emoji">
      💻
    </span>
  );
}

function Home() {
  const [
    popularProducts,
    setPopularProducts,
  ] = useState([]);

  const [
    popularProductsLoading,
    setPopularProductsLoading,
  ] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPopularProducts =
      async () => {
        try {
          const response =
            await fetch(
              `${API}/products/featured`
            );

          if (!response.ok) {
            throw new Error(
              `Products request failed with status ${response.status}`
            );
          }

          const data =
            await response.json();

          if (!isMounted) {
            return;
          }

          const productsFromApi =
            Array.isArray(data)
              ? data
              : Array.isArray(
                  data?.products
                )
              ? data.products
              : [];

          const selectedPopularProducts =
            productsFromApi.filter(
              (product) =>
                product?.is_featured ===
                true
            );

          setPopularProducts(
            selectedPopularProducts
          );
        } catch (error) {
          console.error(
            "Error loading popular products:",
            error
          );

          if (isMounted) {
            setPopularProducts([]);
          }
        } finally {
          if (isMounted) {
            setPopularProductsLoading(
              false
            );
          }
        }
      };

    fetchPopularProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="home-page">
      <Navbar />

      <HeroSection />

      <section className="section category-section">
        <div className="section-heading">
          <span className="section-label">
            SHOP BY CATEGORY
          </span>

          <h2>
            Find What You Need
          </h2>

          <p>
            Explore laptops and accessories
            selected for different needs and
            budgets.
          </p>
        </div>

        <div className="category-grid">
          {categories.map(
            (category) => (
              <a
                href={`/products?category=${encodeURIComponent(
                  category.title
                )}`}
                className="category-card"
                key={
                  category.title
                }
              >
                <div className="category-icon">
                  {
                    category.icon
                  }
                </div>

                <h3>
                  {category.title}
                </h3>

                <p>
                  {
                    category.description
                  }
                </p>

                <span className="card-link">
                  View Products →
                </span>
              </a>
            )
          )}
        </div>
      </section>

      {!popularProductsLoading &&
        popularProducts.length >
          0 && (
          <section className="section products-section">
            <div className="section-heading">
              <span className="section-label">
                FEATURED PRODUCTS
              </span>

              <h2>
                Popular Products
              </h2>

              <p>
                Explore some of the products
                selected by our admin.
              </p>
            </div>

            <div className="product-grid">
              {popularProducts.map(
                (product) => {
                  const productId =
                    getProductId(
                      product
                    );

                  const displayedPrice =
                    getDisplayedPrice(
                      product
                    );

                  const originalPrice =
                    getOriginalPrice(
                      product
                    );

                  return (
                    <article
                      className="product-card"
                      key={
                        productId
                      }
                    >
                      <div className="product-image">
                        <a
                          href={`/products/${productId}`}
                          style={{
                            display:
                              "flex",
                            width:
                              "100%",
                            height:
                              "100%",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            textDecoration:
                              "none",
                          }}
                        >
                          <PopularProductImage
                            product={
                              product
                            }
                          />
                        </a>

                        <span className="product-badge">
                          Featured
                        </span>
                      </div>

                      <div className="product-info">
                        <h3>
                          {
                            product?.name ||
                            "Product"
                          }
                        </h3>

                        <div className="product-rating">
                          {"★★★★★"}

                          <span>
                            (
                            {
                              Number(
                                product?.review_count ||
                                  product?.reviews ||
                                  0
                              )
                            }
                            )
                          </span>
                        </div>

                        <div className="product-price">
                          <strong>
                            {formatPrice(
                              displayedPrice
                            )}
                          </strong>

                          {originalPrice && (
                            <del>
                              {formatPrice(
                                originalPrice
                              )}
                            </del>
                          )}
                        </div>

                        <a
                          href={`/products/${productId}`}
                          className="add-cart-button"
                        >
                          View Description
                        </a>
                      </div>
                    </article>
                  );
                }
              )}
            </div>

            <div className="center-button">
              <a
                href="/products"
                className="outline-button"
              >
                View All Products
              </a>
            </div>
          </section>
        )}

      <section className="benefits-section">
        <div className="section-heading">
          <span className="section-label">
            WHY CHOOSE US
          </span>

          <h2>
            Shopping Made Simple
          </h2>

          <p>
            We focus on providing quality
            products and a smooth shopping
            experience.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map(
            (benefit) => (
              <div
                className="benefit-card"
                key={
                  benefit.title
                }
              >
                <div className="benefit-icon">
                  {
                    benefit.icon
                  }
                </div>

                <h3>
                  {benefit.title}
                </h3>

                <p>
                  {
                    benefit.description
                  }
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="delivery-section">
        <div className="delivery-content">
          <span className="section-label">
            LATEST DEALS
          </span>

          <h2>
            Upgrade Your Setup Today
          </h2>

          <p>
            Find laptops and accessories
            at competitive prices and choose
            the technology that works best
            for you.
          </p>

          <a
            href="/products"
            className="primary-button"
          >
            Browse Products
          </a>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="section-heading">
          <span className="section-label">
            CUSTOMER REVIEWS
          </span>

          <h2>
            What Our Customers Say
          </h2>

          <p>
            Real experiences from customers
            who shop with us.
          </p>
        </div>

        <div className="testimonial-grid">
          {testimonials.map(
            (testimonial) => (
              <article
                className="testimonial-card"
                key={
                  testimonial.name
                }
              >
                <div className="testimonial-stars">
                  {
                    "★".repeat(
                      testimonial.rating
                    )
                  }
                </div>

                <p>
                  "{testimonial.text}"
                </p>

                <strong>
                  {
                    testimonial.name
                  }
                </strong>

                <span>
                  Verified Customer
                </span>
              </article>
            )
          )}
        </div>
      </section>

      <section className="section community-section">
        <div className="section-heading">
          <span className="section-label">
            OUR STORE
          </span>

          <h2>
            Build Your Perfect Setup
          </h2>

          <p>
            From powerful laptops to
            everyday accessories, find
            everything you need in one
            place.
          </p>
        </div>

        <div className="community-grid">
          <div className="community-box">
            💻
          </div>

          <div className="community-box">
            ⌨️
          </div>

          <div className="community-box">
            🖱️
          </div>

          <div className="community-box">
            🎧
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Home;
