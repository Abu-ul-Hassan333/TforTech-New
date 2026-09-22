import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import AdminLayout from "../AdminLayout/AdminLayout";

import "./AdminOrders.css";

const API_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://127.0.0.1:8000";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const getOrderItemImages = (
  item
) => {
  if (
    Array.isArray(
      item?.images
    ) &&
    item.images.length > 0
  ) {
    return item.images.filter(
      Boolean
    );
  }

  if (
    Array.isArray(
      item?.image_urls
    ) &&
    item.image_urls.length > 0
  ) {
    return item.image_urls.filter(
      Boolean
    );
  }

  if (
    item?.image
  ) {
    return [
      item.image,
    ];
  }

  if (
    item?.image_url
  ) {
    return [
      item.image_url,
    ];
  }

  return [];
};

const getProductImages = (
  product
) => {
  if (
    Array.isArray(
      product?.images
    ) &&
    product.images.length > 0
  ) {
    return product.images.filter(
      Boolean
    );
  }

  if (
    Array.isArray(
      product?.image_urls
    ) &&
    product.image_urls.length > 0
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

const getOrderItemImageUrl = (
  item,
  currentProduct
) => {
  const productImages =
    getProductImages(
      currentProduct
    );

  const orderImages =
    getOrderItemImages(
      item
    );

  const image =
    productImages.length > 0
      ? productImages[0]
      : orderImages.length > 0
      ? orderImages[0]
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

  return `${API_URL}${
    imageString.startsWith("/")
      ? ""
      : "/"
  }${imageString}`;
};

function AdminOrders() {
  const navigate =
    useNavigate();

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    productDetailsById,
    setProductDetailsById,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    updatingOrderId,
    setUpdatingOrderId,
  ] = useState("");

  const [
    deletingOrderId,
    setDeletingOrderId,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const currentUserRole =
    String(
      localStorage.getItem(
        "tfortech_user_role"
      ) || ""
    )
      .toLowerCase()
      .trim();

  const isAdmin =
    currentUserRole ===
    "admin";

  // =========================================================
  // AUTHENTICATION FAILURE
  // =========================================================

  const handleAuthenticationFailure =
    () => {
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

      authKeys.forEach(
        (key) => {
          localStorage.removeItem(
            key
          );
        }
      );

      navigate("/login");
    };

  // =========================================================
  // FETCH ALL ORDERS
  // =========================================================

  useEffect(() => {
    const fetchAllOrders =
      async () => {
        try {
          setLoading(true);
          setError("");
          setSuccessMessage("");

          const token =
            localStorage.getItem(
              "tfortech_access_token"
            );

          const loggedIn =
            localStorage.getItem(
              "tfortech_logged_in"
            ) === "true";

          const userRole =
            String(
              localStorage.getItem(
                "tfortech_user_role"
              ) ||
                "customer"
            )
              .toLowerCase()
              .trim();

          if (
            !token ||
            !loggedIn
          ) {
            handleAuthenticationFailure();
            return;
          }

          const canManageOrders =
            userRole ===
              "co_admin" ||
            userRole ===
              "admin";

          if (
            !canManageOrders
          ) {
            setError(
              "Access denied. Only authorized administrators can view all orders."
            );

            setLoading(
              false
            );

            return;
          }

          const response =
            await fetch(
              `${API_URL}/api/auth/admin/orders`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept:
                    "application/json",
                },
              }
            );

          if (
            response.status ===
            401
          ) {
            handleAuthenticationFailure();
            return;
          }

          if (
            response.status ===
            403
          ) {
            setError(
              "Access denied. Only authorized administrators can view all orders."
            );

            return;
          }

          if (
            !response.ok
          ) {
            let errorMessage =
              "Unable to load orders.";

            try {
              const errorData =
                await response.json();

              errorMessage =
                errorData.detail ||
                errorMessage;
            } catch {
              // Keep default error message.
            }

            throw new Error(
              errorMessage
            );
          }

          const data =
            await response.json();

          if (
            !Array.isArray(
              data
            )
          ) {
            throw new Error(
              "Invalid orders data received from the server."
            );
          }

          setOrders(
            data
          );

          const productIds = [
            ...new Set(
              data
                .flatMap(
                  (
                    order
                  ) =>
                    Array.isArray(
                      order?.items
                    )
                      ? order.items
                          .map(
                            (
                              item
                            ) =>
                              item?.product_id
                          )
                          .filter(
                            Boolean
                          )
                      : []
                )
                .map(
                  (
                    productId
                  ) =>
                    String(
                      productId
                    )
                )
            ),
          ];

          if (
            productIds.length >
            0
          ) {
            const productResults =
              await Promise.all(
                productIds.map(
                  async (
                    productId
                  ) => {
                    try {
                      const productResponse =
                        await fetch(
                          `${API_URL}/api/products/${encodeURIComponent(
                            productId
                          )}`,
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
                        !productResponse.ok
                      ) {
                        return null;
                      }

                      const productData =
                        await productResponse.json();

                      return (
                        productData?.product ||
                        productData?.item ||
                        productData?.data ||
                        productData ||
                        null
                      );
                    } catch (
                      productError
                    ) {
                      console.error(
                        `Unable to load product ${productId}:`,
                        productError
                      );

                      return null;
                    }
                  }
                )
              );

            const productsMap =
              {};

            productResults.forEach(
              (
                product,
                index
              ) => {
                if (
                  !product
                ) {
                  return;
                }

                const resolvedId =
                  getProductId(
                    product
                  ) ||
                  productIds[
                    index
                  ];

                productsMap[
                  String(
                    resolvedId
                  )
                ] =
                  product;
              }
            );

            setProductDetailsById(
              productsMap
            );
          }
        } catch (
          fetchError
        ) {
          console.error(
            "Admin orders fetch error:",
            fetchError
          );

          setError(
            fetchError.message ||
              "Unable to load orders. Please try again."
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    fetchAllOrders();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const handleStatusChange =
    async (
      orderId,
      newStatus
    ) => {
      try {
        setUpdatingOrderId(
          orderId
        );

        setError("");
        setSuccessMessage("");

        const token =
          localStorage.getItem(
            "tfortech_access_token"
          );

        if (!token) {
          handleAuthenticationFailure();
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/auth/admin/orders/${orderId}/status?new_status=${encodeURIComponent(
              newStatus
            )}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept:
                  "application/json",
              },
            }
          );

        if (
          response.status ===
          401
        ) {
          handleAuthenticationFailure();
          return;
        }

        if (
          response.status ===
          403
        ) {
          setError(
            "Access denied. Only authorized administrators can update orders."
          );

          return;
        }

        if (
          !response.ok
        ) {
          let errorMessage =
            "Unable to update order status.";

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData.detail ||
              errorMessage;
          } catch {
            // Keep default error message.
          }

          throw new Error(
            errorMessage
          );
        }

        const updatedOrder =
          await response.json();

        setOrders(
          (
            currentOrders
          ) =>
            currentOrders.map(
              (order) =>
                order.id ===
                updatedOrder.id
                  ? updatedOrder
                  : order
            )
        );

        const shortOrderId =
          String(
            orderId
          ).slice(-8);

        setSuccessMessage(
          `Order #${shortOrderId} status updated to ${newStatus}.`
        );
      } catch (
        updateError
      ) {
        console.error(
          "Order status update error:",
          updateError
        );

        setError(
          updateError.message ||
            "Unable to update order status."
        );
      } finally {
        setUpdatingOrderId("");
      }
    };

  // =========================================================
  // DELETE ORDER
  // =========================================================

  const handleDeleteOrder =
    async (
      orderId
    ) => {
      if (
        !isAdmin
      ) {
        setError(
          "Access denied. Only Admin can delete orders."
        );

        return;
      }

      const shortOrderId =
        String(
          orderId
        ).slice(-8);

      const confirmed =
        window.confirm(
          `Are you sure you want to permanently delete Order #${shortOrderId}? This action cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      const token =
        localStorage.getItem(
          "tfortech_access_token"
        );

      if (!token) {
        handleAuthenticationFailure();
        return;
      }

      try {
        setDeletingOrderId(
          orderId
        );

        setError("");
        setSuccessMessage("");

        const response =
          await fetch(
            `${API_URL}/api/auth/admin/orders/${orderId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept:
                  "application/json",
              },
            }
          );

        if (
          response.status ===
          401
        ) {
          handleAuthenticationFailure();
          return;
        }

        if (
          response.status ===
          403
        ) {
          setError(
            "Access denied. Only Admin can delete orders."
          );

          return;
        }

        if (
          !response.ok
        ) {
          let errorMessage =
            "Unable to delete order.";

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData.detail ||
              errorMessage;
          } catch {
            // Keep default error message.
          }

          throw new Error(
            errorMessage
          );
        }

        setOrders(
          (
            currentOrders
          ) =>
            currentOrders.filter(
              (
                order
              ) =>
                String(
                  order.id
                ) !==
                String(
                  orderId
                )
            )
        );

        setSuccessMessage(
          `Order #${shortOrderId} deleted successfully.`
        );
      } catch (
        deleteError
      ) {
        console.error(
          "Order delete error:",
          deleteError
        );

        setError(
          deleteError.message ||
            "Unable to delete order."
        );
      } finally {
        setDeletingOrderId("");
      }
    };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    dateString
  ) => {
    if (!dateString) {
      return "Date unavailable";
    }

    const date =
      new Date(
        dateString
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Date unavailable";
    }

    return date.toLocaleString();
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (
    amount
  ) => {
    const numericAmount =
      Number(amount) || 0;

    return `PKR ${numericAmount.toLocaleString(
      "en-PK",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================================================
  // ORDER STATUS CLASS
  // =========================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "Pending":
        return "admin-order-status-pending";

      case "Processing":
        return "admin-order-status-processing";

      case "Shipped":
        return "admin-order-status-shipped";

      case "Delivered":
        return "admin-order-status-delivered";

      case "Cancelled":
        return "admin-order-status-cancelled";

      default:
        return "admin-order-status-default";
    }
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-orders-page">
          <main className="admin-orders-container">
            <div className="admin-orders-loading">
              <div className="admin-orders-spinner"></div>

              <h2>
                Loading Orders
              </h2>

              <p>
                Please wait while we load
                customer orders.
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
      <div className="admin-orders-page">
        <main className="admin-orders-container">

          {/* ================================================
              HEADER
          ================================================= */}

          <section className="admin-orders-header">

            <div>
              <span className="admin-orders-eyebrow">
                ADMIN PANEL
              </span>

              <h1>
                Customer Orders
              </h1>

              <p>
                Manage customer orders and
                update their delivery status.
              </p>
            </div>

            <div className="admin-orders-header-actions">

              <div className="admin-orders-count">
                <strong>
                  {
                    orders.length
                  }
                </strong>

                <span>
                  Total Orders
                </span>
              </div>

              <button
                type="button"
                className="admin-orders-home-button"
                onClick={() =>
                  navigate("/")
                }
              >
                Back to Store
              </button>

            </div>

          </section>

          {/* ================================================
              SUCCESS MESSAGE
          ================================================= */}

          {successMessage && (
            <div className="admin-orders-success">
              {
                successMessage
              }
            </div>
          )}

          {/* ================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="admin-orders-error">
              <strong>
                Something went wrong
              </strong>

              <span>
                {error}
              </span>
            </div>
          )}

          {/* ================================================
              EMPTY STATE
          ================================================= */}

          {!error &&
            orders.length ===
              0 && (
              <section className="admin-orders-empty">

                <div className="admin-orders-empty-icon">
                  🛒
                </div>

                <h2>
                  No Orders Yet
                </h2>

                <p>
                  There are currently no
                  customer orders in the system.
                </p>

              </section>
            )}

          {/* ================================================
              ORDERS
          ================================================= */}

          {orders.length >
            0 && (
            <section className="admin-orders-list">

              {orders.map(
                (
                  order,
                  index
                ) => {

                  const shortOrderId =
                    order.id
                      ? String(
                          order.id
                        ).slice(
                          -8
                        )
                      : `ORDER-${index + 1}`;

                  return (
                    <article
                      key={
                        order.id ||
                        `order-${index}`
                      }
                      className="admin-order-card"
                    >

                      {/* ======================================
                          ORDER HEADER
                      ======================================= */}

                      <div className="admin-order-card-header">

                        <div className="admin-order-main-info">

                          <span className="admin-order-label">
                            ORDER
                          </span>

                          <h2>
                            #
                            {
                              shortOrderId
                            }
                          </h2>

                          <p>
                            {formatDate(
                              order.created_at
                            )}
                          </p>

                        </div>

                        <div className="admin-order-status-area">

                          <span
                            className={`admin-order-status-badge ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status ||
                              "Pending"}
                          </span>

                          <label
                            htmlFor={`status-${order.id}`}
                            className="admin-order-status-label"
                          >
                            Update Status
                          </label>

                          <select
                            id={`status-${order.id}`}
                            value={
                              order.status ||
                              "Pending"
                            }
                            disabled={
                              updatingOrderId ===
                                order.id ||
                              deletingOrderId ===
                                order.id
                            }
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                order.id,
                                event.target
                                  .value
                              )
                            }
                            className="admin-order-status-select"
                          >
                            {ORDER_STATUSES.map(
                              (
                                statusOption
                              ) => (
                                <option
                                  key={
                                    statusOption
                                  }
                                  value={
                                    statusOption
                                  }
                                >
                                  {
                                    statusOption
                                  }
                                </option>
                              )
                            )}
                          </select>

                        </div>

                      </div>

                      {/* ======================================
                          CUSTOMER INFORMATION
                      ======================================= */}

                      <div className="admin-order-section">

                        <div className="admin-order-section-title">
                          Customer Information
                        </div>

                        <div className="admin-order-info-grid">

                          <div className="admin-order-info-item">
                            <span>
                              Customer ID
                            </span>

                            <strong>
                              {
                                order.user_id ||
                                "N/A"
                              }
                            </strong>
                          </div>

                          <div className="admin-order-info-item">
                            <span>
                              Phone
                            </span>

                            <strong>
                              {
                                order.phone ||
                                "N/A"
                              }
                            </strong>
                          </div>

                          <div className="admin-order-info-item admin-order-info-wide">
                            <span>
                              Shipping Address
                            </span>

                            <strong>
                              {
                                order.shipping_address ||
                                "N/A"
                              }
                            </strong>
                          </div>

                          <div className="admin-order-info-item">
                            <span>
                              Payment Method
                            </span>

                            <strong>
                              {
                                order.payment_method ||
                                "Cash on Delivery"
                              }
                            </strong>
                          </div>

                        </div>

                      </div>

                      {/* ======================================
                          ORDER ITEMS
                      ======================================= */}

                      <div className="admin-order-section">

                        <div className="admin-order-section-title">
                          Ordered Products
                        </div>

                        <div className="admin-order-products">

                          {Array.isArray(
                            order.items
                          ) &&
                            order.items.map(
                              (
                                item,
                                itemIndex
                              ) => {

                                const productId =
                                  item?.product_id ||
                                  getProductId(
                                    productDetailsById[
                                      String(
                                        item?.product_id
                                      )
                                    ]
                                  ) ||
                                  "";

                                const currentProduct =
                                  productDetailsById[
                                    String(
                                      item?.product_id
                                    )
                                  ] ||
                                  null;

                                const itemImage =
                                  getOrderItemImageUrl(
                                    item,
                                    currentProduct
                                  );

                                const productName =
                                  currentProduct?.name ||
                                  item?.product_name ||
                                  "Product";

                                return (
                                  <div
                                    key={`${order.id}-${item.product_id}-${itemIndex}`}
                                    className="admin-order-product"
                                  >

                                    <div className="admin-order-product-image-wrapper">

                                      {itemImage ? (
                                        <Link
                                          to={`/products/${productId}`}
                                          aria-label={`View ${productName} description`}
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
                                          <img
                                            src={
                                              itemImage
                                            }
                                            alt={
                                              productName
                                            }
                                            className="admin-order-product-image"
                                          />
                                        </Link>
                                      ) : (
                                        <Link
                                          to={
                                            productId
                                              ? `/products/${productId}`
                                              : "/products"
                                          }
                                          aria-label={`View ${productName} description`}
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
                                          <div className="admin-order-product-placeholder">
                                            💻
                                          </div>
                                        </Link>
                                      )}

                                    </div>

                                    <div className="admin-order-product-details">

                                      <h3>
                                        {
                                          productName
                                        }
                                      </h3>

                                      <p>
                                        Product ID:{" "}
                                        {
                                          productId ||
                                          "N/A"
                                        }
                                      </p>

                                      <span>
                                        Quantity:{" "}
                                        {
                                          item.quantity ||
                                          0
                                        }
                                      </span>

                                    </div>

                                    <div className="admin-order-product-price">

                                      <span>
                                        Unit Price
                                      </span>

                                      <strong>
                                        {formatCurrency(
                                          item.price
                                        )}
                                      </strong>

                                      <small>
                                        Subtotal:{" "}
                                        {formatCurrency(
                                          Number(
                                            item.price
                                          ) *
                                            Number(
                                              item.quantity
                                            )
                                        )}
                                      </small>

                                    </div>

                                  </div>
                                );
                              }
                            )}

                        </div>

                      </div>

                      {/* ======================================
                          ORDER FOOTER
                      ======================================= */}

                      <div className="admin-order-card-footer">

                        <div>
                          <span>
                            Order Total
                          </span>

                          <strong>
                            {formatCurrency(
                              order.total_amount
                            )}
                          </strong>
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "12px",
                            flexWrap:
                              "wrap",
                            justifyContent:
                              "flex-end",
                          }}
                        >

                          {updatingOrderId ===
                            order.id && (
                            <span className="admin-order-updating">
                              Updating order...
                            </span>
                          )}

                          {deletingOrderId ===
                            order.id && (
                            <span className="admin-order-updating">
                              Deleting order...
                            </span>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              className="admin-order-delete-button"
                              onClick={() =>
                                handleDeleteOrder(
                                  order.id
                                )
                              }
                              disabled={
                                updatingOrderId ===
                                  order.id ||
                                deletingOrderId ===
                                  order.id
                              }
                            >
                              {deletingOrderId ===
                              order.id
                                ? "Deleting..."
                                : "Delete Order"}
                            </button>
                          )}

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </section>
          )}

        </main>
      </div>
    </AdminLayout>
  );
}

export default AdminOrders;
