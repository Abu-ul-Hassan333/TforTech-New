import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../AdminLayout/AdminLayout";

import "./AdminProducts.css";

const API_URL = "http://127.0.0.1:8000";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "",
  image: "",
  shortDescription: "",
  description: "",
  processor: "",
  ram: "",
  storage: "",
  display: "",
  graphics: "",
  operatingSystem: "",
  stock: "",
  condition: "Used",
  is_featured: false,
};

function AdminProducts() {
  const navigate = useNavigate();

  const imageInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [updatingStockId, setUpdatingStockId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const [imageSource, setImageSource] = useState("url");
  const [selectedImageName, setSelectedImageName] = useState("");

  // =========================================================
  // AUTHENTICATION FAILURE
  // =========================================================

  const handleAuthenticationFailure = () => {
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
  };

  // =========================================================
  // GET AUTH TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("tfortech_access_token");
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        handleAuthenticationFailure();
        return;
      }

      const response = await fetch(`${API_URL}/api/products/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }

      if (response.status === 403) {
        setError(
          "Access denied. Only authorized administrators can manage products."
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load products.");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (fetchError) {
      console.error(
        "Admin products fetch error:",
        fetchError
      );

      setError(
        fetchError.message ||
          "Unable to load products. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("tfortech_logged_in") === "true";

    const token = getToken();

    const userRole =
      String(
        localStorage.getItem(
          "tfortech_user_role"
        ) || "customer"
      )
        .toLowerCase()
        .trim();

    if (!loggedIn || !token) {
      navigate("/login");
      return;
    }

    const canManageProducts =
      userRole === "admin" ||
      userRole === "co_admin";

    if (!canManageProducts) {
      setError(
        "Access denied. Only authorized administrators can access product management."
      );
      setLoading(false);
      return;
    }

    fetchProducts();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // =========================================================
  // FORM INPUT
  // =========================================================

  const handleInputChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================================
  // IMAGE SOURCE
  // =========================================================

  const handleImageSourceChange = (source) => {
    setImageSource(source);
    setError("");

    if (source === "url") {
      setSelectedImageName("");

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } else {
      setForm((currentForm) => ({
        ...currentForm,
        image: "",
      }));
    }
  };

  // =========================================================
  // IMAGE GALLERY
  // =========================================================

  const handleGalleryImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        "Image size must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError(
          "Unable to process the selected image."
        );
        return;
      }

      setForm((currentForm) => ({
        ...currentForm,
        image: reader.result,
      }));

      setSelectedImageName(file.name);
      setImageSource("gallery");
    };

    reader.onerror = () => {
      setError(
        "Unable to read the selected image. Please try again."
      );
    };

    reader.readAsDataURL(file);
  };

  // =========================================================
  // CLEAR IMAGE
  // =========================================================

  const handleClearImage = () => {
    setForm((currentForm) => ({
      ...currentForm,
      image: "",
    }));

    setSelectedImageName("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingProductId("");
    setShowForm(false);
    setImageSource("url");
    setSelectedImageName("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAddProduct = () => {
    setError("");
    setSuccessMessage("");
    setForm(EMPTY_FORM);
    setEditingProductId("");
    setImageSource("url");
    setSelectedImageName("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setShowForm(true);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEditProduct = (product) => {
    setError("");
    setSuccessMessage("");

    const specifications =
      product.specifications || {};

    setForm({
      name: product.name || "",
      price:
        product.price !== undefined &&
        product.price !== null
          ? String(product.price)
          : "",
      category: product.category || "",
      image: product.image || "",
      shortDescription:
        product.shortDescription || "",
      description:
        product.description || "",
      processor:
        specifications.processor || "",
      ram:
        specifications.ram || "",
      storage:
        specifications.storage || "",
      display:
        specifications.display || "",
      graphics:
        specifications.graphics || "",
      operatingSystem:
        specifications.operatingSystem || "",
      stock:
        product.stock !== undefined &&
        product.stock !== null
          ? String(product.stock)
          : "",
      condition:
        product.condition || "Used",
      is_featured:
        Boolean(product.is_featured),
    });

    setImageSource("url");
    setSelectedImageName("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setEditingProductId(product.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Product name is required.";
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      return "Please enter a valid product price.";
    }

    if (!form.category.trim()) {
      return "Product category is required.";
    }

    if (!form.shortDescription.trim()) {
      return "Short description is required.";
    }

    if (!form.description.trim()) {
      return "Product description is required.";
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      return "Please enter a valid stock quantity.";
    }

    return "";
  };

  // =========================================================
  // CREATE / UPDATE PRODUCT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        handleAuthenticationFailure();
        return;
      }

      const productData = {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        image:
          form.image.trim() || null,
        shortDescription:
          form.shortDescription.trim(),
        description:
          form.description.trim(),
        specifications: {
          processor:
            form.processor.trim(),
          ram:
            form.ram.trim(),
          storage:
            form.storage.trim(),
          display:
            form.display.trim(),
          graphics:
            form.graphics.trim(),
          operatingSystem:
            form.operatingSystem.trim(),
        },
        stock: Number(form.stock),
        condition:
          form.condition || "Used",
        is_featured:
          form.is_featured,
      };

      const isEditing =
        Boolean(editingProductId);

      const endpoint = isEditing
        ? `${API_URL}/api/products/${editingProductId}`
        : `${API_URL}/api/products/`;

      const method = isEditing
        ? "PUT"
        : "POST";

      const response = await fetch(
        endpoint,
        {
          method,
          headers: {
            Authorization:
              `Bearer ${token}`,
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            productData
          ),
        }
      );

      if (response.status === 401) {
        handleAuthenticationFailure();
        return;
      }

      if (response.status === 403) {
        setError(
          "Access denied. Only authorized administrators can manage products."
        );
        return;
      }

      if (!response.ok) {
        let errorMessage =
          isEditing
            ? "Unable to update product."
            : "Unable to create product.";

        try {
          const errorData =
            await response.json();

          if (errorData.detail) {
            if (
              Array.isArray(
                errorData.detail
              )
            ) {
              errorMessage =
                errorData.detail
                  .map(
                    (item) =>
                      item.msg ||
                      "Invalid product data."
                  )
                  .join(" ");
            } else {
              errorMessage =
                errorData.detail;
            }
          }
        } catch (parseError) {
          // Keep default error message.
        }

        throw new Error(
          errorMessage
        );
      }

      const savedProduct =
        await response.json();

      const productResult =
        savedProduct?.product ||
        savedProduct;

      if (isEditing) {
        setProducts(
          (currentProducts) =>
            currentProducts.map(
              (product) =>
                product.id ===
                productResult.id
                  ? productResult
                  : product
            )
        );

        setSuccessMessage(
          "Product updated successfully."
        );
      } else {
        setProducts(
          (currentProducts) => [
            productResult,
            ...currentProducts,
          ]
        );

        setSuccessMessage(
          "Product added successfully."
        );
      }

      resetForm();
    } catch (submitError) {
      console.error(
        "Admin product save error:",
        submitError
      );

      setError(
        submitError.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDeleteProduct =
    async (productId) => {
      const product =
        products.find(
          (item) =>
            item.id === productId
        );

      const productName =
        product?.name ||
        "this product";

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${productName}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(productId);
        setError("");
        setSuccessMessage("");

        const token = getToken();

        if (!token) {
          handleAuthenticationFailure();
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/products/${productId}`,
            {
              method: "DELETE",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                Accept:
                  "application/json",
              },
            }
          );

        if (response.status === 401) {
          handleAuthenticationFailure();
          return;
        }

        if (response.status === 403) {
          setError(
            "Access denied. Only authorized administrators can delete products."
          );
          return;
        }

        if (!response.ok) {
          let errorMessage =
            "Unable to delete product.";

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData.detail ||
              errorMessage;
          } catch (parseError) {
            // Keep default error message.
          }

          throw new Error(
            errorMessage
          );
        }

        setProducts(
          (currentProducts) =>
            currentProducts.filter(
              (product) =>
                product.id !==
                productId
            )
        );

        if (
          editingProductId ===
          productId
        ) {
          resetForm();
        }

        setSuccessMessage(
          "Product deleted successfully."
        );
      } catch (deleteError) {
        console.error(
          "Admin product delete error:",
          deleteError
        );

        setError(
          deleteError.message ||
            "Unable to delete product."
        );
      } finally {
        setDeletingId("");
      }
    };

  // =========================================================
  // UPDATE STOCK
  // =========================================================

  const handleStockUpdate =
    async (
      productId,
      currentStock
    ) => {
      const newStock =
        window.prompt(
          "Enter the new stock quantity:",
          String(
            currentStock ?? 0
          )
        );

      if (newStock === null) {
        return;
      }

      if (
        newStock.trim() === "" ||
        Number.isNaN(
          Number(newStock)
        ) ||
        Number(newStock) < 0
      ) {
        setError(
          "Please enter a valid stock quantity."
        );
        return;
      }

      try {
        setUpdatingStockId(
          productId
        );
        setError("");
        setSuccessMessage("");

        const token = getToken();

        if (!token) {
          handleAuthenticationFailure();
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/products/${productId}/stock`,
            {
              method: "PATCH",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                Accept:
                  "application/json",
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                stock:
                  Number(newStock),
              }),
            }
          );

        if (response.status === 401) {
          handleAuthenticationFailure();
          return;
        }

        if (response.status === 403) {
          setError(
            "Access denied. Only authorized administrators can update product stock."
          );
          return;
        }

        if (!response.ok) {
          let errorMessage =
            "Unable to update stock.";

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData.detail ||
              errorMessage;
          } catch (parseError) {
            // Keep default error message.
          }

          throw new Error(
            errorMessage
          );
        }

        const updatedProductResponse =
          await response.json();

        const updatedProduct =
          updatedProductResponse?.product ||
          updatedProductResponse;

        setProducts(
          (currentProducts) =>
            currentProducts.map(
              (product) =>
                product.id ===
                updatedProduct.id
                  ? updatedProduct
                  : product
            )
        );

        setSuccessMessage(
          "Product stock updated successfully."
        );
      } catch (stockError) {
        console.error(
          "Admin product stock update error:",
          stockError
        );

        setError(
          stockError.message ||
            "Unable to update product stock."
        );
      } finally {
        setUpdatingStockId("");
      }
    };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (amount) => {
    return `PKR ${Number(
      amount || 0
    ).toLocaleString(
      "en-PK",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================================================
  // PRODUCT IMAGE
  // =========================================================

  const renderProductImage =
    (product) => {
      if (product.image) {
        return (
          <img
            src={product.image}
            alt={
              product.name ||
              "Product"
            }
            className="admin-product-image"
          />
        );
      }

      return (
        <div className="admin-product-image-placeholder">
          💻
        </div>
      );
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-products-page">
          <main className="admin-products-main">
            <div className="admin-products-loading">
              <div className="admin-products-spinner"></div>

              <h2>
                Loading Products
              </h2>

              <p>
                Please wait while we
                load the products.
              </p>
            </div>
          </main>
        </div>
      </AdminLayout>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <AdminLayout>
      <div className="admin-products-page">
        <main className="admin-products-main">
          <div className="admin-products-container">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="admin-products-header">
              <div>
                <span className="admin-products-eyebrow">
                  ADMIN PANEL
                </span>

                <h1>
                  Product Management
                </h1>

                <p>
                  Add, edit, delete and
                  manage products in your
                  store.
                </p>
              </div>

              <div className="admin-products-header-actions">

                <button
                  type="button"
                  className="admin-products-dashboard-button"
                  onClick={() =>
                    navigate("/admin")
                  }
                >
                  Dashboard
                </button>

                <button
                  type="button"
                  className="admin-products-add-button"
                  onClick={
                    handleAddProduct
                  }
                >
                  + Add Product
                </button>

              </div>
            </section>

            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (
              <div className="admin-products-success">
                {successMessage}
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="admin-products-error">
                <strong>
                  Something went wrong
                </strong>

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* =================================================
                PRODUCT FORM
            ================================================= */}

            {showForm && (
              <section className="admin-products-form-section">

                <div className="admin-products-form-header">

                  <div>
                    <span className="admin-products-section-label">
                      {editingProductId
                        ? "EDIT PRODUCT"
                        : "NEW PRODUCT"}
                    </span>

                    <h2>
                      {editingProductId
                        ? "Edit Product"
                        : "Add New Product"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="admin-products-cancel-button"
                    onClick={
                      resetForm
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                </div>

                <form
                  className="admin-products-form"
                  onSubmit={
                    handleSubmit
                  }
                >

                  <div className="admin-products-form-grid">

                    <div className="admin-products-field">
                      <label htmlFor="name">
                        Product Name *
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={
                          handleInputChange
                        }
                        placeholder="e.g. Dell Latitude 5420"
                        required
                      />
                    </div>

                    <div className="admin-products-field">
                      <label htmlFor="price">
                        Price (PKR) *
                      </label>

                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          form.price
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="85000"
                        required
                      />
                    </div>

                    <div className="admin-products-field">
                      <label htmlFor="category">
                        Category *
                      </label>

                      <input
                        id="category"
                        name="category"
                        type="text"
                        value={
                          form.category
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Dell"
                        required
                      />
                    </div>

                    <div className="admin-products-field">
                      <label htmlFor="condition">
                        Condition
                      </label>

                      <select
                        id="condition"
                        name="condition"
                        value={
                          form.condition
                        }
                        onChange={
                          handleInputChange
                        }
                      >
                        <option value="New">
                          New
                        </option>

                        <option value="Used">
                          Used
                        </option>

                        <option value="Refurbished">
                          Refurbished
                        </option>
                      </select>
                    </div>

                    {/* =========================================
                        PRODUCT IMAGE
                    ========================================= */}

                    <div className="admin-products-field admin-products-field-wide">

                      <label>
                        Product Image
                      </label>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: "10px",
                          marginBottom:
                            "14px",
                          flexWrap:
                            "wrap",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            handleImageSourceChange(
                              "url"
                            )
                          }
                          disabled={
                            saving
                          }
                          style={{
                            padding:
                              "10px 18px",
                            borderRadius:
                              "8px",
                            border:
                              imageSource ===
                              "url"
                                ? "2px solid #111827"
                                : "1px solid #d1d5db",
                            background:
                              imageSource ===
                              "url"
                                ? "#111827"
                                : "#ffffff",
                            color:
                              imageSource ===
                              "url"
                                ? "#ffffff"
                                : "#374151",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Image URL
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleImageSourceChange(
                              "gallery"
                            )
                          }
                          disabled={
                            saving
                          }
                          style={{
                            padding:
                              "10px 18px",
                            borderRadius:
                              "8px",
                            border:
                              imageSource ===
                              "gallery"
                                ? "2px solid #111827"
                                : "1px solid #d1d5db",
                            background:
                              imageSource ===
                              "gallery"
                                ? "#111827"
                                : "#ffffff",
                            color:
                              imageSource ===
                              "gallery"
                                ? "#ffffff"
                                : "#374151",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Choose from Gallery
                        </button>

                      </div>

                      {imageSource ===
                        "url" && (
                        <input
                          id="image"
                          name="image"
                          type="url"
                          value={
                            form.image
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="https://example.com/product.jpg"
                          disabled={
                            saving
                          }
                        />
                      )}

                      {imageSource ===
                        "gallery" && (
                        <div
                          style={{
                            border:
                              "1px dashed #cbd5e1",
                            borderRadius:
                              "12px",
                            padding:
                              "18px",
                            background:
                              "#f8fafc",
                          }}
                        >

                          <input
                            ref={
                              imageInputRef
                            }
                            id="product-gallery-image"
                            type="file"
                            accept="image/*"
                            onChange={
                              handleGalleryImageChange
                            }
                            disabled={
                              saving
                            }
                            style={{
                              display:
                                "none",
                            }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              imageInputRef.current?.click()
                            }
                            disabled={
                              saving
                            }
                            style={{
                              width:
                                "100%",
                              padding:
                                "14px 18px",
                              borderRadius:
                                "10px",
                              border:
                                "1px solid #d1d5db",
                              background:
                                "#ffffff",
                              color:
                                "#111827",
                              cursor:
                                "pointer",
                              fontWeight:
                                600,
                              fontSize:
                                "14px",
                            }}
                          >
                            📁 Choose Image from Gallery
                          </button>

                          <p
                            style={{
                              margin:
                                "10px 0 0",
                              fontSize:
                                "13px",
                              color:
                                "#64748b",
                              textAlign:
                                "center",
                            }}
                          >
                            JPG, JPEG, PNG,
                            WEBP and other
                            image formats up
                            to 5 MB.
                          </p>

                          {selectedImageName && (
                            <div
                              style={{
                                marginTop:
                                  "12px",
                                padding:
                                  "10px 12px",
                                borderRadius:
                                  "8px",
                                background:
                                  "#ecfdf5",
                                color:
                                  "#166534",
                                fontSize:
                                  "13px",
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              ✓ Selected:{" "}
                              {
                                selectedImageName
                              }
                            </div>
                          )}

                        </div>
                      )}

                      {form.image && (
                        <div
                          style={{
                            marginTop:
                              "16px",
                            border:
                              "1px solid #e5e7eb",
                            borderRadius:
                              "12px",
                            padding:
                              "14px",
                            background:
                              "#ffffff",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              gap:
                                "12px",
                              marginBottom:
                                "10px",
                            }}
                          >

                            <strong
                              style={{
                                fontSize:
                                  "14px",
                                color:
                                  "#111827",
                              }}
                            >
                              Image Preview
                            </strong>

                            <button
                              type="button"
                              onClick={
                                handleClearImage
                              }
                              disabled={
                                saving
                              }
                              style={{
                                border:
                                  "none",
                                background:
                                  "transparent",
                                color:
                                  "#dc2626",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  600,
                                fontSize:
                                  "13px",
                              }}
                            >
                              Remove Image
                            </button>

                          </div>

                          <div
                            style={{
                              width:
                                "100%",
                              height:
                                "220px",
                              borderRadius:
                                "10px",
                              overflow:
                                "hidden",
                              background:
                                "#f8fafc",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              border:
                                "1px solid #e5e7eb",
                            }}
                          >
                            <img
                              src={
                                form.image
                              }
                              alt="Product preview"
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "contain",
                              }}
                              onError={() => {
                                setError(
                                  "The selected image could not be previewed. Please choose another image."
                                );
                              }}
                            />
                          </div>

                        </div>
                      )}

                    </div>

                    <div className="admin-products-field">
                      <label htmlFor="stock">
                        Stock *
                      </label>

                      <input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.stock
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="10"
                        required
                      />
                    </div>

                    <div className="admin-products-field admin-products-field-wide">
                      <label htmlFor="shortDescription">
                        Short Description *
                      </label>

                      <input
                        id="shortDescription"
                        name="shortDescription"
                        type="text"
                        value={
                          form.shortDescription
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Short product description"
                        required
                      />
                    </div>

                    <div className="admin-products-field admin-products-field-wide">
                      <label htmlFor="description">
                        Full Description *
                      </label>

                      <textarea
                        id="description"
                        name="description"
                        rows="5"
                        value={
                          form.description
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Enter complete product description..."
                        required
                      ></textarea>
                    </div>

                  </div>

                  {/* =========================================
                      FEATURED PRODUCT
                  ========================================= */}

                  <div className="admin-products-featured-section">

                    <label className="admin-products-featured-checkbox">

                      <input
                        id="is_featured"
                        name="is_featured"
                        type="checkbox"
                        checked={
                          form.is_featured
                        }
                        onChange={
                          handleInputChange
                        }
                        disabled={
                          saving
                        }
                      />

                      <span>
                        Show in Featured Products
                        (Homepage)
                      </span>

                    </label>

                  </div>

                  {/* =========================================
                      SPECIFICATIONS
                  ========================================= */}

                  <div className="admin-products-specifications">

                    <div className="admin-products-specifications-heading">

                      <span className="admin-products-section-label">
                        SPECIFICATIONS
                      </span>

                      <h3>
                        Product Specifications
                      </h3>

                    </div>

                    <div className="admin-products-form-grid">

                      <div className="admin-products-field">
                        <label htmlFor="processor">
                          Processor
                        </label>

                        <input
                          id="processor"
                          name="processor"
                          type="text"
                          value={
                            form.processor
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="Intel Core i5"
                        />
                      </div>

                      <div className="admin-products-field">
                        <label htmlFor="ram">
                          RAM
                        </label>

                        <input
                          id="ram"
                          name="ram"
                          type="text"
                          value={
                            form.ram
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="16GB"
                        />
                      </div>

                      <div className="admin-products-field">
                        <label htmlFor="storage">
                          Storage
                        </label>

                        <input
                          id="storage"
                          name="storage"
                          type="text"
                          value={
                            form.storage
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="512GB SSD"
                        />
                      </div>

                      <div className="admin-products-field">
                        <label htmlFor="display">
                          Display
                        </label>

                        <input
                          id="display"
                          name="display"
                          type="text"
                          value={
                            form.display
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="14 inch"
                        />
                      </div>

                      <div className="admin-products-field">
                        <label htmlFor="graphics">
                          Graphics
                        </label>

                        <input
                          id="graphics"
                          name="graphics"
                          type="text"
                          value={
                            form.graphics
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="Intel Iris Xe"
                        />
                      </div>

                      <div className="admin-products-field">
                        <label htmlFor="operatingSystem">
                          Operating System
                        </label>

                        <input
                          id="operatingSystem"
                          name="operatingSystem"
                          type="text"
                          value={
                            form.operatingSystem
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="Windows 11"
                        />
                      </div>

                    </div>

                  </div>

                  {/* =========================================
                      FORM ACTIONS
                  ========================================= */}

                  <div className="admin-products-form-actions">

                    <button
                      type="button"
                      className="admin-products-secondary-button"
                      onClick={
                        resetForm
                      }
                      disabled={
                        saving
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="admin-products-submit-button"
                      disabled={
                        saving
                      }
                    >
                      {saving
                        ? "Saving..."
                        : editingProductId
                        ? "Update Product"
                        : "Add Product"}
                    </button>

                  </div>

                </form>

              </section>
            )}

            {/* =================================================
                PRODUCTS LIST
            ================================================= */}

            <section className="admin-products-list-section">

              <div className="admin-products-list-header">

                <div>
                  <span className="admin-products-section-label">
                    INVENTORY
                  </span>

                  <h2>
                    All Products
                  </h2>
                </div>

                <div className="admin-products-count">

                  <strong>
                    {products.length}
                  </strong>

                  <span>
                    Products
                  </span>

                </div>

              </div>

              {products.length === 0 ? (

                <div className="admin-products-empty">

                  <div className="admin-products-empty-icon">
                    💻
                  </div>

                  <h3>
                    No Products Found
                  </h3>

                  <p>
                    Add your first product
                    to start managing your
                    inventory.
                  </p>

                  <button
                    type="button"
                    className="admin-products-add-button"
                    onClick={
                      handleAddProduct
                    }
                  >
                    + Add Product
                  </button>

                </div>

              ) : (

                <div className="admin-products-grid">

                  {products.map(
                    (product) => (

                      <article
                        key={
                          product.id
                        }
                        className="admin-product-card"
                      >

                        <div className="admin-product-card-image">

                          {renderProductImage(
                            product
                          )}

                          <span className="admin-product-condition">
                            {
                              product.condition ||
                              "Used"
                            }
                          </span>

                        </div>

                        <div className="admin-product-card-content">

                          <span className="admin-product-category">
                            {
                              product.category ||
                              "Uncategorized"
                            }
                          </span>

                          <h3>
                            {
                              product.name ||
                              "Unnamed Product"
                            }
                          </h3>

                          <p>
                            {
                              product.shortDescription ||
                              "No short description available."
                            }
                          </p>

                          <div className="admin-product-price">
                            {
                              formatCurrency(
                                product.price
                              )
                            }
                          </div>

                          <div className="admin-product-stock-row">

                            <span>
                              Stock
                            </span>

                            <strong
                              className={
                                Number(
                                  product.stock
                                ) > 0
                                  ? "admin-stock-available"
                                  : "admin-stock-out"
                              }
                            >
                              {
                                Number(
                                  product.stock ||
                                  0
                                )
                              }{" "}
                              units
                            </strong>

                          </div>

                          <div className="admin-product-actions">

                            <button
                              type="button"
                              className="admin-product-edit-button"
                              onClick={() =>
                                handleEditProduct(
                                  product
                                )
                              }
                              disabled={
                                saving ||
                                deletingId ===
                                  product.id
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-product-stock-button"
                              onClick={() =>
                                handleStockUpdate(
                                  product.id,
                                  product.stock
                                )
                              }
                              disabled={
                                updatingStockId ===
                                  product.id ||
                                deletingId ===
                                  product.id
                              }
                            >
                              {
                                updatingStockId ===
                                product.id
                                  ? "Updating..."
                                  : "Stock"
                              }
                            </button>

                            <button
                              type="button"
                              className="admin-product-delete-button"
                              onClick={() =>
                                handleDeleteProduct(
                                  product.id
                                )
                              }
                              disabled={
                                deletingId ===
                                  product.id ||
                                saving ||
                                updatingStockId ===
                                  product.id
                              }
                            >
                              {
                                deletingId ===
                                product.id
                                  ? "Deleting..."
                                  : "Delete"
                              }
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
        </main>
      </div>
    </AdminLayout>
  );
}

export default AdminProducts;