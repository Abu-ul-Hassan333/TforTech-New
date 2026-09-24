import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "../Blogging/Blogging.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const formatDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `${BACKEND_URL}${
    image.startsWith("/") ? "" : "/"
  }${image}`;
};

const renderContent = (content) => {
  if (!content) {
    return null;
  }

  const normalizedContent = String(
    content
  )
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  const paragraphs =
    normalizedContent
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

  if (paragraphs.length > 0) {
    return paragraphs.map(
      (paragraph, index) => (
        <p
          key={`blog-paragraph-${index}`}
          style={{
            margin: "0 0 22px",
            whiteSpace: "pre-wrap",
            fontSize: "16px",
            lineHeight: 1.9,
            color: "#4b5563",
          }}
        >
          {paragraph}
        </p>
      )
    );
  }

  return (
    <p
      style={{
        margin: 0,
        whiteSpace: "pre-wrap",
        fontSize: "16px",
        lineHeight: 1.9,
        color: "#4b5563",
      }}
    >
      {normalizedContent}
    </p>
  );
};

function BlogDetails() {
  const { id } = useParams();

  const [blog, setBlog] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${BACKEND_URL}/api/blogs/public/${id}`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to load this blog article."
          );
        }

        if (isMounted) {
          setBlog(
            data?.blog || null
          );
        }
      } catch (fetchError) {
        if (isMounted) {
          setBlog(null);

          setError(
            fetchError?.message ||
              "Unable to load this blog article."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchBlog();
    } else {
      setError(
        "Invalid blog article."
      );
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div
      className="blogging-page"
      style={{
        background: "#f7f8fa",
      }}
    >
      <Navbar />

      {loading ? (
        <section
          style={{
            minHeight: "65vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "600px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                border: "4px solid #e5e7eb",
                borderTopColor: "#d69e78",
                animation:
                  "blog-details-spin 0.8s linear infinite",
              }}
            />

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "24px",
                color: "#111827",
              }}
            >
              Loading Article
            </h2>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "15px",
              }}
            >
              Please wait while we load the
              article.
            </p>
          </div>
        </section>
      ) : error ? (
        <section
          style={{
            minHeight: "65vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              padding: "35px 30px",
              boxSizing: "border-box",
              textAlign: "center",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              boxShadow:
                "0 10px 30px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "12px",
              }}
            >
              📄
            </div>

            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "26px",
                color: "#111827",
              }}
            >
              Article Not Found
            </h1>

            <p
              style={{
                margin: "0 0 22px",
                lineHeight: 1.7,
                color: "#6b7280",
              }}
            >
              {error}
            </p>

            <Link
              to="/blogging"
              className="blogging-cta-button"
              style={{
                display: "inline-flex",
                textDecoration: "none",
              }}
            >
              Back to Blogging
              <span>→</span>
            </Link>
          </div>
        </section>
      ) : blog ? (
        <>
          <section
            style={{
              padding: "55px 20px 30px",
              background: "#f7f8fa",
            }}
          >
            <div
              style={{
                width:
                  "min(1100px, calc(100% - 40px))",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "22px",
                  fontSize: "14px",
                }}
              >
                <Link
                  to="/"
                  style={{
                    color: "#9a6b50",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Home
                </Link>

                <span
                  style={{
                    color: "#9ca3af",
                  }}
                >
                  /
                </span>

                <Link
                  to="/blogging"
                  style={{
                    color: "#9a6b50",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Blogging
                </Link>

                <span
                  style={{
                    color: "#9ca3af",
                  }}
                >
                  /
                </span>

                <span
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Article
                </span>
              </div>

              <div
                style={{
                  maxWidth: "900px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: "30px",
                    padding: "0 11px",
                    marginBottom: "14px",
                    borderRadius: "999px",
                    background: "#f7f2ed",
                    color: "#9a6b50",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  {blog.category ||
                    "Technology"}
                </span>

                <h1
                  style={{
                    margin: "0 0 18px",
                    fontSize:
                      "clamp(32px, 5vw, 54px)",
                    lineHeight: 1.12,
                    color: "#111827",
                    fontWeight: 800,
                  }}
                >
                  {blog.title ||
                    "Untitled Article"}
                </h1>

                {blog.excerpt && (
                  <p
                    style={{
                      margin: "0 0 20px",
                      maxWidth: "820px",
                      fontSize: "18px",
                      lineHeight: 1.75,
                      color: "#6b7280",
                    }}
                  >
                    {blog.excerpt}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px 20px",
                    fontSize: "13px",
                    color: "#8a94a3",
                    fontWeight: 600,
                  }}
                >
                  <span>
                    By{" "}
                    {blog.author ||
                      "GoJuniors"}
                  </span>

                  <span>
                    {formatDate(
                      blog.published_at ||
                        blog.created_at
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <main
            style={{
              padding: "25px 20px 70px",
              background: "#f7f8fa",
            }}
          >
            <div
              style={{
                width:
                  "min(1100px, calc(100% - 40px))",
                margin: "0 auto",
              }}
            >
              <article
                style={{
                  overflow: "hidden",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "20px",
                  boxShadow:
                    "0 12px 32px rgba(15, 23, 42, 0.05)",
                }}
              >
                {blog.image && (
                  <div
                    style={{
                      width: "100%",
                      maxHeight: "560px",
                      overflow: "hidden",
                      background: "#f3f4f6",
                    }}
                  >
                    <img
                      src={getImageUrl(
                        blog.image
                      )}
                      alt={
                        blog.title ||
                        "Blog article"
                      }
                      style={{
                        display: "block",
                        width: "100%",
                        maxHeight: "560px",
                        objectFit: "cover",
                      }}
                      onError={(
                        event
                      ) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    padding:
                      "clamp(24px, 5vw, 52px)",
                  }}
                >
                  {Array.isArray(
                    blog.tags
                  ) &&
                    blog.tags.length >
                      0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap:
                            "wrap",
                          gap: "7px",
                          marginBottom:
                            "26px",
                        }}
                      >
                        {blog.tags.map(
                          (
                            tag,
                            index
                          ) => (
                            <span
                              key={`${tag}-${index}`}
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                minHeight:
                                  "26px",
                                padding:
                                  "0 9px",
                                borderRadius:
                                  "999px",
                                background:
                                  "#f3f4f6",
                                color:
                                  "#4b5563",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  700,
                              }}
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    )}

                  <div>
                    {renderContent(
                      blog.content
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "35px",
                      paddingTop:
                        "24px",
                      borderTop:
                        "1px solid #edf0f3",
                    }}
                  >
                    <Link
                      to="/blogging"
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        gap: "8px",
                        minHeight:
                          "44px",
                        padding:
                          "0 17px",
                        boxSizing:
                          "border-box",
                        border:
                          "1px solid #d69e78",
                        borderRadius:
                          "10px",
                        background:
                          "#d69e78",
                        color:
                          "#ffffff",
                        textDecoration:
                          "none",
                        fontSize:
                          "13px",
                        fontWeight:
                          700,
                      }}
                    >
                      <span>
                        ←
                      </span>
                      Back to All Articles
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </main>
        </>
      ) : null}

      <Footer />

      <style>
        {`
          @keyframes blog-details-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

export default BlogDetails;