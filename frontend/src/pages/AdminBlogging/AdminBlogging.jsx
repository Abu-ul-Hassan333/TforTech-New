import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../AdminLayout/AdminLayout";

import "./AdminBlogging.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "GoJuniors",
  image: "",
  category: "Technology",
  tags: "",
  is_published: false,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function AdminBlogging() {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  const [editingBlog, setEditingBlog] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [imageFileName, setImageFileName] =
    useState("");

  const getToken = useCallback(() => {
    return localStorage.getItem(
      "tfortech_access_token"
    );
  }, []);

  const clearAuthentication = useCallback(() => {
    const authKeys = [
      "tfortech_logged_in",
      "tfortech_access_token",
      "tfortech_token_type",
      "tfortech_user_id",
      "tfortech_user_name",
      "tfortech_user_email",
      "tfortech_user_phone",
      "tfortech_user_role",
      "tfortech_remember_me",
    ];

    authKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    navigate("/login");
  }, [navigate]);

  const getErrorMessage = useCallback((responseData) => {
    if (!responseData) {
      return "Something went wrong. Please try again.";
    }

    if (
      typeof responseData.detail ===
      "string"
    ) {
      return responseData.detail;
    }

    if (
      Array.isArray(responseData.detail)
    ) {
      return responseData.detail
        .map((item) => {
          if (
            typeof item === "string"
          ) {
            return item;
          }

          return (
            item?.msg ||
            "Invalid input."
          );
        })
        .join(", ");
    }

    if (
      typeof responseData.message ===
      "string"
    ) {
      return responseData.message;
    }

    return "Something went wrong. Please try again.";
  }, []);

  const handleResponseError = useCallback(async (
    response,
    defaultMessage
  ) => {
    if (response.status === 401) {
      clearAuthentication();

      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "Access denied. Admin access is required."
      );
    }

    let responseData = null;

    try {
      responseData = await response.json();
    } catch (parseError) {
      responseData = null;
    }

    throw new Error(
      getErrorMessage(
        responseData
      ) || defaultMessage
    );
  }, [clearAuthentication, getErrorMessage]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const loggedIn =
        localStorage.getItem(
          "tfortech_logged_in"
        ) === "true";

      const userRole =
        localStorage.getItem(
          "tfortech_user_role"
        );

      if (!token || !loggedIn) {
        clearAuthentication();
        return;
      }

      if (userRole !== "admin") {
        setError(
          "Access denied. Only administrators can manage blogs."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API}/blogs/admin`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        await handleResponseError(
          response,
          "Unable to load blogs."
        );
      }

      const data =
        await response.json();

      const blogList =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.blogs)
          ? data.blogs
          : [];

      setBlogs(blogList);
    } catch (fetchError) {
      console.error(
        "Admin blogging fetch error:",
        fetchError
      );

      setError(
        fetchError.message ||
          "Unable to load blogs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [clearAuthentication, getToken, handleResponseError]);

  useEffect(() => {
    fetchBlogs();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [fetchBlogs]);

  const handleInputChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSlugGeneration = () => {
    const generatedSlug =
      String(formData.title || "")
        .trim()
        .toLowerCase()
        .replace(
          /[^a-z0-9\s-_]/g,
          ""
        )
        .replace(
          /\s+/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        );

    setFormData((previous) => ({
      ...previous,
      slug: generatedSlug,
    }));
  };

  const handleImageFile = (
    event
  ) => {
    const file =
      event.target.files?.[0] ||
      null;

    setError("");
    setImageFileName("");

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size > MAX_IMAGE_SIZE
    ) {
      setError(
        "Blog image must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result === "string"
      ) {
        setFormData(
          (previous) => ({
            ...previous,
            image: result,
          })
        );

        setImageFileName(
          file.name
        );
      }
    };

    reader.onerror = () => {
      setError(
        "Unable to read the selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  const resetImageInput = () => {
    const input =
      document.getElementById(
        "blog-image-file"
      );

    if (input) {
      input.value = "";
    }

    setImageFileName("");
  };

  const resetForm = () => {
    setFormData(
      EMPTY_FORM
    );

    setEditingBlog(null);

    setImageFileName("");

    setError("");
    setSuccess("");

    resetImageInput();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const startEdit = (blog) => {
    if (!blog) {
      return;
    }

    setEditingBlog(blog);

    setFormData({
      title:
        blog.title || "",
      slug:
        blog.slug || "",
      excerpt:
        blog.excerpt || "",
      content:
        blog.content || "",
      author:
        blog.author ||
        "GoJuniors",
      image:
        blog.image || "",
      category:
        blog.category ||
        "Technology",
      tags:
        Array.isArray(blog.tags)
          ? blog.tags.join(", ")
          : "",
      is_published:
        Boolean(
          blog.is_published
        ),
    });

    setImageFileName("");

    setError("");
    setSuccess("");

    resetImageInput();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const buildPayload = () => {
    const tags =
      String(
        formData.tags || ""
      )
        .split(",")
        .map((tag) =>
          tag.trim()
        )
        .filter(
          (tag, index, array) =>
            tag &&
            array.indexOf(tag) ===
              index
        );

    return {
      title:
        formData.title.trim(),
      slug:
        formData.slug.trim(),
      excerpt:
        formData.excerpt.trim(),
      content:
        formData.content.trim(),
      author:
        formData.author.trim() ||
        "GoJuniors",
      image:
        formData.image.trim() ||
        null,
      category:
        formData.category.trim() ||
        "Technology",
      tags,
      is_published:
        Boolean(
          formData.is_published
        ),
    };
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const payload =
        buildPayload();

      if (!payload.title) {
        throw new Error(
          "Blog title is required."
        );
      }

      if (!payload.content) {
        throw new Error(
          "Blog content is required."
        );
      }

      if (!payload.slug) {
        const generatedSlug =
          payload.title
            .toLowerCase()
            .replace(
              /[^a-z0-9\s-_]/g,
              ""
            )
            .replace(
              /\s+/g,
              "-"
            )
            .replace(
              /-+/g,
              "-"
            )
            .replace(
              /^-+|-+$/g,
              ""
            );

        payload.slug =
          generatedSlug;
      }

      const url = editingBlog
        ? `${API}/blogs/admin/${editingBlog.id}`
        : `${API}/blogs/admin`;

      const method = editingBlog
        ? "PUT"
        : "POST";

      const response =
        await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        });

      if (!response.ok) {
        await handleResponseError(
          response,
          editingBlog
            ? "Unable to update blog."
            : "Unable to create blog."
        );
      }

      const data =
        await response.json();

      setSuccess(
        data?.message ||
          (editingBlog
            ? "Blog updated successfully."
            : "Blog created successfully.")
      );

      resetForm();

      await fetchBlogs();
    } catch (submitError) {
      console.error(
        "Admin blogging submit error:",
        submitError
      );

      setError(
        submitError.message ||
          "Unable to save blog. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    blogId
  ) => {
    if (!blogId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this blog? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(blogId);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const response =
        await fetch(
          `${API}/blogs/admin/${blogId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept:
                "application/json",
            },
          }
        );

      if (!response.ok) {
        await handleResponseError(
          response,
          "Unable to delete blog."
        );
      }

      const data =
        await response.json();

      setBlogs(
        (previous) =>
          previous.filter(
            (blog) =>
              blog.id !==
              blogId
          )
      );

      if (
        editingBlog?.id ===
        blogId
      ) {
        resetForm();
      }

      setSuccess(
        data?.message ||
          "Blog deleted successfully."
      );
    } catch (deleteError) {
      console.error(
        "Admin blogging delete error:",
        deleteError
      );

      setError(
        deleteError.message ||
          "Unable to delete blog. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublish =
    async (blog) => {
      if (!blog?.id) {
        return;
      }

      setError("");
      setSuccess("");

      try {
        const token =
          getToken();

        const nextPublished =
          !Boolean(
            blog.is_published
          );

        const response =
          await fetch(
            `${API}/blogs/admin/${blog.id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept:
                  "application/json",
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                is_published:
                  nextPublished,
              }),
            }
          );

        if (!response.ok) {
          await handleResponseError(
            response,
            "Unable to update blog status."
          );
        }

        const data =
          await response.json();

        const updatedBlog =
          data?.blog;

        if (updatedBlog) {
          setBlogs(
            (previous) =>
              previous.map(
                (item) =>
                  item.id ===
                  blog.id
                    ? updatedBlog
                    : item
              )
          );
        } else {
          await fetchBlogs();
        }

        setSuccess(
          nextPublished
            ? "Blog published successfully."
            : "Blog moved to draft successfully."
        );
      } catch (statusError) {
        console.error(
          "Admin blogging status error:",
          statusError
        );

        setError(
          statusError.message ||
            "Unable to update blog status."
        );
      }
    };

  const getImageUrl = (
    image
  ) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      ) ||
      image.startsWith(
        "data:"
      )
    ) {
      return image;
    }

    return `${BACKEND_URL}${
      image.startsWith("/")
        ? ""
        : "/"
    }${image}`;
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-PK",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <AdminLayout>
      <div className="admin-blogging-page">
        <div className="admin-blogging-header">
          <div>
            <span className="admin-blogging-eyebrow">
              CONTENT MANAGEMENT
            </span>

            <h1>
              Blogging Management
            </h1>

            <p>
              Create, edit, publish and manage the blog posts displayed on the GoJuniors website.
            </p>
          </div>

          <div className="admin-blogging-count">
            <strong>
              {blogs.length}
            </strong>

            <span>
              Total Blogs
            </span>
          </div>
        </div>

        {error && (
          <div className="admin-blogging-alert admin-blogging-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-blogging-alert admin-blogging-alert-success">
            {success}
          </div>
        )}

        <section className="admin-blogging-form-card">
          <div className="admin-blogging-card-header">
            <div>
              <h2>
                {editingBlog
                  ? "Edit Blog Post"
                  : "Create New Blog Post"}
              </h2>

              <p>
                Add your blog content below and choose whether it should be published on the customer website.
              </p>
            </div>

            {editingBlog && (
              <button
                type="button"
                className="admin-blogging-cancel-button"
                onClick={
                  resetForm
                }
                disabled={
                  saving
                }
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            className="admin-blogging-form"
            onSubmit={
              handleSubmit
            }
          >
            <div className="admin-blogging-form-grid">
              <div className="admin-blogging-field admin-blogging-field-full">
                <label htmlFor="blog-title">
                  Blog Title
                </label>

                <input
                  id="blog-title"
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter blog title"
                  maxLength={200}
                  disabled={
                    saving
                  }
                  required
                />
              </div>

              <div className="admin-blogging-field">
                <label htmlFor="blog-slug">
                  Slug
                </label>

                <div className="admin-blogging-inline-input">
                  <input
                    id="blog-slug"
                    type="text"
                    name="slug"
                    value={
                      formData.slug
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="blog-post-slug"
                    maxLength={250}
                    disabled={
                      saving
                    }
                  />

                  <button
                    type="button"
                    className="admin-blogging-generate-button"
                    onClick={
                      handleSlugGeneration
                    }
                    disabled={
                      saving ||
                      !formData.title
                    }
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="admin-blogging-field">
                <label htmlFor="blog-category">
                  Category
                </label>

                <input
                  id="blog-category"
                  type="text"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Technology"
                  maxLength={100}
                  disabled={
                    saving
                  }
                />
              </div>

              <div className="admin-blogging-field">
                <label htmlFor="blog-author">
                  Author
                </label>

                <input
                  id="blog-author"
                  type="text"
                  name="author"
                  value={
                    formData.author
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="GoJuniors"
                  maxLength={100}
                  disabled={
                    saving
                  }
                />
              </div>

              <div className="admin-blogging-field">
                <label htmlFor="blog-tags">
                  Tags
                </label>

                <input
                  id="blog-tags"
                  type="text"
                  name="tags"
                  value={
                    formData.tags
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="laptops, technology, gaming"
                  disabled={
                    saving
                  }
                />

                <small>
                  Separate tags with commas.
                </small>
              </div>

              <div className="admin-blogging-field admin-blogging-field-full">
                <label htmlFor="blog-excerpt">
                  Short Description
                </label>

                <textarea
                  id="blog-excerpt"
                  name="excerpt"
                  value={
                    formData.excerpt
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Write a short introduction for the blog card."
                  maxLength={1000}
                  rows={4}
                  disabled={
                    saving
                  }
                />

                <small>
                  This text can be shown as the blog preview on the customer page.
                </small>
              </div>

              <div className="admin-blogging-field admin-blogging-field-full">
                <label htmlFor="blog-content">
                  Blog Content
                </label>

                <textarea
                  id="blog-content"
                  name="content"
                  value={
                    formData.content
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Write the complete blog article here..."
                  maxLength={50000}
                  rows={14}
                  disabled={
                    saving
                  }
                  required
                />

                <small>
                  You can write the complete article here.
                </small>
              </div>

              <div className="admin-blogging-field admin-blogging-field-full">
                <label>
                  Blog Image
                </label>

                <div className="admin-blogging-image-actions">
                  <label
                    htmlFor="blog-image-file"
                    className="admin-blogging-file-button"
                  >
                    Choose Image
                  </label>

                  <input
                    id="blog-image-file"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageFile
                    }
                    disabled={
                      saving
                    }
                  />

                  {imageFileName && (
                    <span className="admin-blogging-file-name">
                      {imageFileName}
                    </span>
                  )}
                </div>

                <small>
                  Maximum image size: 5 MB.
                </small>

                <input
                  type="url"
                  name="image"
                  value={
                    formData.image.startsWith(
                      "data:"
                    )
                      ? ""
                      : formData.image
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Or paste an image URL"
                  disabled={
                    saving
                  }
                />

                {formData.image && (
                  <div className="admin-blogging-image-preview">
                    <img
                      src={getImageUrl(
                        formData.image
                      )}
                      alt="Blog preview"
                      onError={(
                        event
                      ) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="admin-blogging-field admin-blogging-field-full">
                <label className="admin-blogging-publish-toggle">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={
                      formData.is_published
                    }
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      saving
                    }
                  />

                  <span className="admin-blogging-toggle-ui"></span>

                  <span>
                    Publish this blog on the customer website
                  </span>
                </label>
              </div>
            </div>

            <div className="admin-blogging-form-actions">
              <button
                type="submit"
                className="admin-blogging-save-button"
                disabled={
                  saving
                }
              >
                {saving
                  ? editingBlog
                    ? "Updating..."
                    : "Creating..."
                  : editingBlog
                  ? "Update Blog"
                  : "Create Blog"}
              </button>

              <button
                type="button"
                className="admin-blogging-reset-button"
                onClick={
                  resetForm
                }
                disabled={
                  saving
                }
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="admin-blogging-list-section">
          <div className="admin-blogging-list-header">
            <div>
              <h2>
                Blog Posts
              </h2>

              <p>
                Manage all blog posts stored in MongoDB.
              </p>
            </div>

            <button
              type="button"
              className="admin-blogging-refresh-button"
              onClick={
                fetchBlogs
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="admin-blogging-state">
              <div className="admin-blogging-spinner"></div>

              <p>
                Loading blog posts...
              </p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="admin-blogging-empty">
              <div className="admin-blogging-empty-icon">
                ✎
              </div>

              <h3>
                No blog posts yet
              </h3>

              <p>
                Create your first blog post using the form above.
              </p>
            </div>
          ) : (
            <div className="admin-blogging-grid">
              {blogs.map(
                (blog) => (
                  <article
                    className="admin-blogging-card"
                    key={blog.id}
                  >
                    <div className="admin-blogging-card-image">
                      {blog.image ? (
                        <img
                          src={getImageUrl(
                            blog.image
                          )}
                          alt={
                            blog.title ||
                            "Blog"
                          }
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="admin-blogging-card-image-placeholder">
                          <span>
                            BLOG
                          </span>

                          <p>
                            No image
                          </p>
                        </div>
                      )}

                      <span
                        className={`admin-blogging-status ${
                          blog.is_published
                            ? "published"
                            : "draft"
                        }`}
                      >
                        {blog.is_published
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    <div className="admin-blogging-card-content">
                      <div className="admin-blogging-card-meta">
                        <span>
                          {blog.category ||
                            "Technology"}
                        </span>

                        <span>
                          {formatDate(
                            blog.created_at
                          )}
                        </span>
                      </div>

                      <h3>
                        {blog.title ||
                          "Untitled Blog"}
                      </h3>

                      <p className="admin-blogging-card-excerpt">
                        {blog.excerpt ||
                          "No short description available."}
                      </p>

                      <div className="admin-blogging-card-author">
                        By{" "}
                        {blog.author ||
                          "GoJuniors"}
                      </div>

                      {Array.isArray(
                        blog.tags
                      ) &&
                        blog.tags.length >
                          0 && (
                          <div className="admin-blogging-tags">
                            {blog.tags
                              .slice(
                                0,
                                5
                              )
                              .map(
                                (
                                  tag
                                ) => (
                                  <span
                                    key={`${blog.id}-${tag}`}
                                  >
                                    {tag}
                                  </span>
                                )
                              )}
                          </div>
                        )}

                      <div className="admin-blogging-card-actions">
                        <button
                          type="button"
                          className="admin-blogging-edit-button"
                          onClick={() =>
                            startEdit(
                              blog
                            )
                          }
                          disabled={
                            deletingId ===
                            blog.id
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-blogging-publish-button"
                          onClick={() =>
                            togglePublish(
                              blog
                            )
                          }
                          disabled={
                            deletingId ===
                            blog.id
                          }
                        >
                          {blog.is_published
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          className="admin-blogging-delete-button"
                          onClick={() =>
                            handleDelete(
                              blog.id
                            )
                          }
                          disabled={
                            deletingId ===
                            blog.id
                          }
                        >
                          {deletingId ===
                          blog.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminBlogging;