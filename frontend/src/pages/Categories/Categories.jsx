import React, {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Categories.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const API =
  `${BACKEND_URL}/api`;

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

const brandList = [
  {
    slug: "hp",
    logo: "HP",
    title: "HP",
  },
  {
    slug: "dell",
    logo: "D",
    title: "Dell",
  },
  {
    slug: "lenovo",
    logo: "L",
    title: "Lenovo",
  },
  {
    slug: "macbook",
    logo: "",
    title: "MacBook",
  },
];

const getProductId = (
  product
) => {
  return (
    product?.product_id ||
    product?.id ||
    product?._id ||
    null
  );
};

const getProductImages = (
  product
) => {
  if (
    Array.isArray(
      product?.images
    ) &&
    product.images.length >
      0
  ) {
    return product.images.filter(
      Boolean
    );
  }

  if (
    Array.isArray(
      product?.image_urls
    ) &&
    product.image_urls.length >
      0
  ) {
    return product.image_urls.filter(
      Boolean
    );
  }

  if (
    product?.image
  ) {
    return [
      product.image,
    ];
  }

  if (
    product?.image_url
  ) {
    return [
      product.image_url,
    ];
  }

  return [];
};

const getImageUrl = (
  product
) => {
  const images =
    getProductImages(
      product
    );

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
    imageString.startsWith(
      "http://"
    ) ||
    imageString.startsWith(
      "https://"
    ) ||
    imageString.startsWith(
      "data:"
    ) ||
    imageString.startsWith(
      "blob:"
    )
  ) {
    return imageString;
  }

  return `${BACKEND_URL}${
    imageString.startsWith(
      "/"
    )
      ? ""
      : "/"
  }${imageString}`;
};

const formatPrice = (
  price
) => {
  return `PKR ${Number(
    price || 0
  ).toLocaleString(
    "en-PK"
  )}`;
};

const getCurrentProductPrice = (
  product
) => {
  const originalPrice =
    Number(
      product?.price || 0
    );

  const discountPrice =
    Number(
      product?.discount_price
    );

  if (
    Number.isFinite(
      discountPrice
    ) &&
    discountPrice > 0 &&
    discountPrice <
      originalPrice
  ) {
    return discountPrice;
  }

  return originalPrice;
};

const getOriginalPrice = (
  product
) => {
  const originalPrice =
    Number(
      product?.price || 0
    );

  const discountPrice =
    Number(
      product?.discount_price
    );

  if (
    Number.isFinite(
      discountPrice
    ) &&
    discountPrice > 0 &&
    discountPrice <
      originalPrice
  ) {
    return originalPrice;
  }

  return null;
};

const getProductBrandText = (
  product
) => {
  const values = [
    product?.brand,
    product?.category,
    product?.name,
    product?.description,
    product?.shortDescription,
    product?.short_description,
    product?.condition,
  ];

  const specificationValues =
    product?.specifications &&
    typeof product.specifications ===
      "object"
      ? Object.values(
          product.specifications
        )
      : [];

  const deviceSpecValues =
    product?.device_specs &&
    typeof product.device_specs ===
      "object"
      ? Object.values(
          product.device_specs
        )
      : [];

  return [
    ...values,
    ...specificationValues,
    ...deviceSpecValues,
  ]
    .filter(
      (value) =>
        value !== null &&
        value !== undefined
    )
    .map((value) =>
      String(value)
        .toLowerCase()
        .trim()
    )
    .join(" ");
};

const productBelongsToBrand = (
  product,
  brandSlug
) => {
  const searchableText =
    getProductBrandText(
      product
    );

  if (
    !searchableText
  ) {
    return false;
  }

  if (
    brandSlug ===
    "hp"
  ) {
    return (
      searchableText.includes(
        "hp "
      ) ||
      searchableText ===
        "hp" ||
      searchableText.includes(
        "hewlett packard"
      )
    );
  }

  if (
    brandSlug ===
    "dell"
  ) {
    return searchableText.includes(
      "dell"
    );
  }

  if (
    brandSlug ===
    "lenovo"
  ) {
    return (
      searchableText.includes(
        "lenovo"
      ) ||
      searchableText.includes(
        "thinkpad"
      )
    );
  }

  if (
    brandSlug ===
    "macbook"
  ) {
    return (
      searchableText.includes(
        "macbook"
      ) ||
      searchableText.includes(
        "apple"
      )
    );
  }

  return false;
};

function ProductImage({
  product,
}) {
  const [
    imageError,
    setImageError,
  ] = useState(false);

  const imageUrl =
    getImageUrl(
      product
    );

  useEffect(() => {
    setImageError(false);
  }, [
    imageUrl,
  ]);

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
        className="category-product-real-image"
        onError={() =>
          setImageError(
            true
          )
        }
      />
    );
  }

  return (
    <div className="category-product-image-fallback">
      <span className="category-product-icon">
        💻
      </span>

      <span className="category-product-placeholder-text">
        Product Image
      </span>
    </div>
  );
}

function Categories() {
  const location =
    useLocation();

  const pathParts =
    location.pathname
      .split("/")
      .filter(
        Boolean
      );

  const brand =
    pathParts[1]?.toLowerCase() ||
    "";

  const selectedBrand =
    brandData[brand];

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  useEffect(() => {
    if (
      !brand ||
      !selectedBrand
    ) {
      setProducts([]);
      setLoading(false);
      setLoadError("");
      return;
    }

    let isMounted =
      true;

    const fetchProducts =
      async () => {
        try {
          setLoading(true);
          setLoadError("");

          const response =
            await fetch(
              `${API}/products/?page=1&limit=5000`,
              {
                method:
                  "GET",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              `Products request failed with status ${response.status}`
            );
          }

          const data =
            await response.json();

          if (
            !isMounted
          ) {
            return;
          }

          const receivedProducts =
            Array.isArray(
              data
            )
              ? data
              : Array.isArray(
                  data?.products
                )
              ? data.products
              : Array.isArray(
                  data?.items
                )
              ? data.items
              : [];

          const brandProducts =
            receivedProducts.filter(
              (product) =>
                productBelongsToBrand(
                  product,
                  brand
                )
            );

          setProducts(
            brandProducts
          );
        } catch (
          error
        ) {
          console.error(
            "Categories products loading error:",
            error
          );

          if (
            isMounted
          ) {
            setProducts([]);
            setLoadError(
              "Unable to load products from the database."
            );
          }
        } finally {
          if (
            isMounted
          ) {
            setLoading(false);
          }
        }
      };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [
    brand,
    selectedBrand,
  ]);

  if (!brand) {
    return (
      <div className="categories-page">
        <Navbar />

        <section className="categories-hero">
          <div className="categories-hero-content">
            <span className="categories-hero-label">
              LAPTOP BRANDS
            </span>

            <h1>
              Shop by Brand
            </h1>

            <p>
              Explore laptops and accessories from trusted technology brands and
              find the right product for your needs.
            </p>

            <div className="categories-breadcrumb">
              <Link to="/">
                Home
              </Link>

              <span>
                /
              </span>

              <span>
                Categories
              </span>
            </div>
          </div>
        </section>

        <main className="categories-main">
          <div className="categories-container">
            <div className="categories-section-heading">
              <div>
                <span className="categories-eyebrow">
                  OUR BRANDS
                </span>

                <h2>
                  Choose a Brand
                </h2>

                <p>
                  Select a brand to explore its available laptops and accessories.
                </p>
              </div>
            </div>

            <div className="brand-grid">
              {brandList.map(
                ({
                  slug,
                  logo,
                  title,
                }) => (
                  <Link
                    key={
                      slug
                    }
                    to={`/categories/${slug}`}
                    className="brand-card"
                  >
                    <span className="brand-card-logo">
                      {
                        logo
                      }
                    </span>

                    <div className="brand-card-content">
                      <span className="brand-card-label">
                        Laptop Brand
                      </span>

                      <h3>
                        {
                          title
                        }
                      </h3>

                      <p>
                        {
                          brandData[
                            slug
                          ]
                            .description
                        }
                      </p>

                      <span className="brand-card-link">
                        Explore{" "}
                        {
                          title
                        }{" "}
                        <span>
                          →
                        </span>
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (
    !selectedBrand
  ) {
    return (
      <div className="categories-page">
        <Navbar />

        <main className="categories-not-found">
          <div className="categories-container">
            <span className="categories-not-found-icon">
              404
            </span>

            <h1>
              Brand Not Found
            </h1>

            <p>
              The brand you are looking for is not available.
            </p>

            <Link
              to="/categories"
              className="categories-primary-button"
            >
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
            {
              selectedBrand.name.toUpperCase()
            }
          </span>

          <h1>
            {
              selectedBrand.title
            }
          </h1>

          <p>
            {
              selectedBrand.description
            }
          </p>

          <div className="categories-breadcrumb">
            <Link to="/">
              Home
            </Link>

            <span>
              /
            </span>

            <Link to="/categories">
              Categories
            </Link>

            <span>
              /
            </span>

            <span>
              {
                selectedBrand.name
              }
            </span>
          </div>
        </div>
      </section>

      <main className="categories-main">
        <div className="categories-container">
          <div className="categories-products-heading">
            <div>
              <span className="categories-eyebrow">
                {
                  selectedBrand.name.toUpperCase()
                }{" "}
                COLLECTION
              </span>

              <h2>
                {
                  selectedBrand.name
                }{" "}
                Products
              </h2>

              <p>
                Browse available{" "}
                {
                  selectedBrand.name
                }{" "}
                laptops and accessories.
              </p>
            </div>

            <span className="categories-product-count">
              {loading
                ? "Loading..."
                : `${products.length} ${
                    products.length ===
                    1
                      ? "Product"
                      : "Products"
                  }`}
            </span>
          </div>

          {loading ? (
            <div className="categories-empty">
              <h3>
                Loading Products
              </h3>

              <p>
                Please wait while we load{" "}
                {
                  selectedBrand.name
                }{" "}
                products from the database.
              </p>
            </div>
          ) : loadError ? (
            <div className="categories-empty">
              <h3>
                Unable to Load Products
              </h3>

              <p>
                {
                  loadError
                }
              </p>

              <Link
                to="/products"
                className="categories-primary-button"
              >
                View All Products
              </Link>
            </div>
          ) : products.length >
            0 ? (
            <div className="categories-product-grid">
              {products.map(
                (
                  product
                ) => {
                  const productId =
                    getProductId(
                      product
                    );

                  const currentPrice =
                    getCurrentProductPrice(
                      product
                    );

                  const originalPrice =
                    getOriginalPrice(
                      product
                    );

                  const condition =
                    product?.condition ||
                    product
                      ?.device_specs
                      ?.condition ||
                    "Available";

                  const description =
                    product?.shortDescription ||
                    product?.short_description ||
                    product?.description ||
                    "Product description available on the product details page.";

                  return (
                    <article
                      className="category-product-card"
                      key={
                        productId
                      }
                    >
                      <div className="category-product-image-wrapper">
                        <div className="category-product-image">
                          <Link
                            to={`/products/${productId}`}
                            className="category-product-image-link"
                          >
                            <ProductImage
                              product={
                                product
                              }
                            />
                          </Link>
                        </div>

                        <span className="category-product-condition">
                          {
                            condition
                          }
                        </span>
                      </div>

                      <div className="category-product-content">
                        <span className="category-product-category">
                          {
                            product?.category ||
                            selectedBrand.name
                          }
                        </span>

                        <h3>
                          {
                            product?.name ||
                            "Unnamed Product"
                          }
                        </h3>

                        <p>
                          {
                            description
                          }
                        </p>

                        <div className="category-product-bottom">
                          <div>
                            <strong>
                              {formatPrice(
                                currentPrice
                              )}
                            </strong>

                            {originalPrice && (
                              <del
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "4px",
                                  opacity:
                                    0.65,
                                  fontSize:
                                    "0.88rem",
                                }}
                              >
                                {formatPrice(
                                  originalPrice
                                )}
                              </del>
                            )}
                          </div>

                          <Link
                            to={`/products/${productId}`}
                            className="category-product-button"
                          >
                            View Description{" "}
                            <span>
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="categories-empty">
              <h3>
                No products available
              </h3>

              <p>
                There are currently no{" "}
                {
                  selectedBrand.name
                }{" "}
                products available in the database.
              </p>

              <Link
                to="/products"
                className="categories-primary-button"
              >
                View All Products
              </Link>
            </div>
          )}

          <div className="categories-all-products">
            <Link
              to="/products"
              className="categories-primary-button"
            >
              View All Products{" "}
              <span>
                →
              </span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Categories;
