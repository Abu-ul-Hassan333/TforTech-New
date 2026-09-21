import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../AdminLayout/AdminLayout";

import "./AdminProducts.css";

const API_URL =
  "http://127.0.0.1:8000";

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "",
  image: "",
  images: [],
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

  const imageInputRef =
    useRef(null);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const [
    updatingStockId,
    setUpdatingStockId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    editingProductId,
    setEditingProductId,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState(EMPTY_FORM);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    imageSource,
    setImageSource,
  ] = useState("url");

  const [
    selectedImageNames,
    setSelectedImageNames,
  ] = useState([]);

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

      navigate(
        "/login"
      );
    };

  // =========================================================
  // GET AUTH TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem(
      "tfortech_access_token"
    );
  };

  // =========================================================
  // PRODUCT ID HELPER
  // =========================================================

  const getProductId = (
    product
  ) => {
    return (
      product?.id ||
      product?._id ||
      product?.product_id ||
      null
    );
  };

  // =========================================================
  // PRODUCT IMAGES HELPER
  // =========================================================

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
      return product.images;
    }

    if (
      Array.isArray(
        product?.image_urls
      ) &&
      product.image_urls.length >
        0
    ) {
      return product.image_urls;
    }

    if (
      product?.image
    ) {
      return [
        product.image,
      ];
    }

    return [];
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts =
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          getToken();

        if (!token) {
          handleAuthenticationFailure();
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/products/`,
            {
              method:
                "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
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
            "Access denied. Only authorized administrators can manage products."
          );
          return;
        }

        if (
          !response.ok
        ) {
          throw new Error(
            "Unable to load products."
          );
        }

        const data =
          await response.json();

        if (
          Array.isArray(
            data
          )
        ) {
          setProducts(
            data
          );
        } else if (
          Array.isArray(
            data.products
          )
        ) {
          setProducts(
            data.products
          );
        } else {
          setProducts(
            []
          );
        }
      } catch (
        fetchError
      ) {
        console.error(
          "Admin products fetch error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load products. Please make sure the backend is running."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem(
        "tfortech_logged_in"
      ) === "true";

    const token =
      getToken();

    const userRole =
      String(
        localStorage.getItem(
          "tfortech_user_role"
        ) || "customer"
      )
        .toLowerCase()
        .trim();

    if (
      !loggedIn ||
      !token
    ) {
      navigate(
        "/login"
      );
      return;
    }

    const canManageProducts =
      userRole ===
        "admin" ||
      userRole ===
        "co_admin";

    if (
      !canManageProducts
    ) {
      setError(
        "Access denied. Only authorized administrators can access product management."
      );

      setLoading(
        false
      );

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

  const handleInputChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      setForm(
        (
          currentForm
        ) => ({
          ...currentForm,
          [name]:
            type ===
            "checkbox"
              ? checked
              : value,
        })
      );

      setError("");
      setSuccessMessage(
        ""
      );
    };

  // =========================================================
  // IMAGE URL CHANGE
  // =========================================================

  const handleImageUrlChange =
    (value) => {
      setForm(
        (
          currentForm
        ) => {
          const previousImages =
            Array.isArray(
              currentForm.images
            )
              ? currentForm.images
              : [];

          let updatedImages =
            [...previousImages];

          if (
            value.trim()
          ) {
            if (
              updatedImages
                .length === 0
            ) {
              updatedImages =
                [
                  value.trim(),
                ];
            } else {
              updatedImages[0] =
                value.trim();
            }
          } else {
            updatedImages =
              updatedImages.slice(
                1
              );
          }

          return {
            ...currentForm,
            image:
              value,
            images:
              updatedImages,
          };
        }
      );

      setError("");
      setSuccessMessage(
        ""
      );
    };

  // =========================================================
  // IMAGE SOURCE
  // =========================================================

  const handleImageSourceChange =
    (source) => {
      setImageSource(
        source
      );

      setError("");

      setSuccessMessage(
        ""
      );

      if (
        source ===
        "url"
      ) {
        setSelectedImageNames(
          []
        );

        if (
          imageInputRef.current
        ) {
          imageInputRef.current.value =
            "";
        }
      }
    };

  // =========================================================
  // FILE TO DATA URL
  // =========================================================

  const readFileAsDataURL =
    (file) => {
      return new Promise(
        (
          resolve,
          reject
        ) => {
          const reader =
            new FileReader();

          reader.onload =
            () => {
              if (
                typeof reader.result !==
                "string"
              ) {
                reject(
                  new Error(
                    `Unable to process ${file.name}.`
                  )
                );

                return;
              }

              resolve(
                reader.result
              );
            };

          reader.onerror =
            () => {
              reject(
                new Error(
                  `Unable to read ${file.name}.`
                )
              );
            };

          reader.readAsDataURL(
            file
          );
        }
      );
    };

  // =========================================================
  // MULTIPLE GALLERY IMAGES
  // =========================================================

  const handleGalleryImageChange =
    async (event) => {
      const files = Array.from(
        event.target.files ||
          []
      );

      if (
        files.length ===
        0
      ) {
        return;
      }

      setError("");
      setSuccessMessage(
        ""
      );

      const validFiles =
        [];

      const invalidMessages =
        [];

      files.forEach(
        (file) => {
          if (
            !file.type.startsWith(
              "image/"
            )
          ) {
            invalidMessages.push(
              `${file.name}: invalid image file.`
            );

            return;
          }

          if (
            file.size >
            MAX_IMAGE_SIZE
          ) {
            invalidMessages.push(
              `${file.name}: image size must be 5 MB or smaller.`
            );

            return;
          }

          validFiles.push(
            file
          );
        }
      );

      if (
        invalidMessages.length >
        0
      ) {
        setError(
          invalidMessages.join(
            " "
          )
        );
      }

      if (
        validFiles.length ===
        0
      ) {
        event.target.value =
          "";

        return;
      }

      try {
        const encodedImages =
          await Promise.all(
            validFiles.map(
              (
                file
              ) =>
                readFileAsDataURL(
                  file
                )
            )
          );

        setForm(
          (
            currentForm
          ) => {
            const existingImages =
              Array.isArray(
                currentForm.images
              )
                ? currentForm.images
                : [];

            const combinedImages =
              [
                ...existingImages,
                ...encodedImages,
              ];

            return {
              ...currentForm,

              image:
                combinedImages[0] ||
                "",

              images:
                combinedImages,
            };
          }
        );

        setSelectedImageNames(
          (
            currentNames
          ) => [
            ...currentNames,
            ...validFiles.map(
              (
                file
              ) =>
                file.name
            ),
          ]
        );

        setImageSource(
          "gallery"
        );
      } catch (
        imageError
      ) {
        console.error(
          "Gallery image processing error:",
          imageError
        );

        setError(
          imageError.message ||
            "Unable to process the selected images."
        );
      } finally {
        event.target.value =
          "";
      }
    };

  // =========================================================
  // REMOVE GALLERY IMAGE
  // =========================================================

  const handleRemoveImage =
    (index) => {
      setForm(
        (
          currentForm
        ) => {
          const updatedImages =
            (
              Array.isArray(
                currentForm.images
              )
                ? currentForm.images
                : []
            ).filter(
              (
                _,
                imageIndex
              ) =>
                imageIndex !==
                index
            );

          return {
            ...currentForm,

            image:
              updatedImages[0] ||
              "",

            images:
              updatedImages,
          };
        }
      );

      setSelectedImageNames(
        (
          currentNames
        ) => {
          if (
            index >=
            currentNames.length
          ) {
            return currentNames;
          }

          return currentNames.filter(
            (
              _,
              nameIndex
            ) =>
              nameIndex !==
              index
          );
        }
      );

      setError("");
      setSuccessMessage(
        ""
      );
    };

  // =========================================================
  // MAKE IMAGE PRIMARY
  // =========================================================

  const handleMakePrimary =
    (index) => {
      setForm(
        (
          currentForm
        ) => {
          const images =
            [
              ...(currentForm.images ||
                []),
            ];

          if (
            index <= 0 ||
            index >=
              images.length
          ) {
            return currentForm;
          }

          const selectedImage =
            images[index];

          const updatedImages =
            [
              selectedImage,
              ...images.filter(
                (
                  _,
                  imageIndex
                ) =>
                  imageIndex !==
                  index
              ),
            ];

          return {
            ...currentForm,

            image:
              updatedImages[0],

            images:
              updatedImages,
          };
        }
      );

      setError("");
      setSuccessMessage(
        ""
      );
    };

  // =========================================================
  // CLEAR ALL IMAGES
  // =========================================================

  const handleClearImages =
    () => {
      setForm(
        (
          currentForm
        ) => ({
          ...currentForm,
          image: "",
          images: [],
        })
      );

      setSelectedImageNames(
        []
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          "";
      }

      setError("");
      setSuccessMessage(
        ""
      );
    };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm(
      EMPTY_FORM
    );

    setEditingProductId(
      ""
    );

    setShowForm(
      false
    );

    setImageSource(
      "url"
    );

    setSelectedImageNames(
      []
    );

    if (
      imageInputRef.current
    ) {
      imageInputRef.current.value =
        "";
    }
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAddProduct =
    () => {
      setError("");
      setSuccessMessage(
        ""
      );

      setForm(
        {
          ...EMPTY_FORM,
          images: [],
        }
      );

      setEditingProductId(
        ""
      );

      setImageSource(
        "url"
      );

      setSelectedImageNames(
        []
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          "";
      }

      setShowForm(
        true
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior:
          "smooth",
      });
    };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEditProduct =
    (product) => {
      setError("");
      setSuccessMessage(
        ""
      );

      const specifications =
        product.specifications ||
        {};

      const productImages =
        getProductImages(
          product
        );

      const primaryImage =
        productImages[0] ||
        product.image ||
        "";

      setForm({
        name:
          product.name ||
          "",

        price:
          product.price !==
            undefined &&
          product.price !==
            null
            ? String(
                product.price
              )
            : "",

        category:
          product.category ||
          "",

        image:
          primaryImage,

        images:
          productImages,

        shortDescription:
          product.shortDescription ||
          product.short_description ||
          "",

        description:
          product.description ||
          "",

        processor:
          specifications.processor ||
          specifications.Processor ||
          "",

        ram:
          specifications.ram ||
          specifications.RAM ||
          "",

        storage:
          specifications.storage ||
          specifications.Storage ||
          "",

        display:
          specifications.display ||
          specifications.Display ||
          "",

        graphics:
          specifications.graphics ||
          specifications.Graphics ||
          "",

        operatingSystem:
          specifications.operatingSystem ||
          specifications.OperatingSystem ||
          "",

        stock:
          product.stock !==
            undefined &&
          product.stock !==
            null
            ? String(
                product.stock
              )
            : "",

        condition:
          product.condition ||
          "Used",

        is_featured:
          Boolean(
            product.is_featured
          ),
      });

      setImageSource(
        primaryImage.startsWith(
          "data:"
        )
          ? "gallery"
          : "url"
      );

      setSelectedImageNames(
        []
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          "";
      }

      setEditingProductId(
        getProductId(
          product
        )
      );

      setShowForm(
        true
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior:
          "smooth",
      });
    };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm =
    () => {
      if (
        !form.name.trim()
      ) {
        return "Product name is required.";
      }

      if (
        form.price ===
          "" ||
        Number(form.price) <
          0
      ) {
        return "Please enter a valid product price.";
      }

      if (
        !form.category.trim()
      ) {
        return "Product category is required.";
      }

      if (
        !form.shortDescription.trim()
      ) {
        return "Short description is required.";
      }

      if (
        !form.description.trim()
      ) {
        return "Product description is required.";
      }

      if (
        form.stock ===
          "" ||
        Number(form.stock) <
          0
      ) {
        return "Please enter a valid stock quantity.";
      }

      if (
        Array.isArray(
          form.images
        ) &&
        form.images.length >
          10
      ) {
        return "You can add a maximum of 10 product images.";
      }

      return "";
    };

  // =========================================================
  // NORMALIZE IMAGE LIST
  // =========================================================

  const getImagesForSave =
    () => {
      const images =
        Array.isArray(
          form.images
        )
          ? form.images
              .map(
                (
                  image
                ) =>
                  String(
                    image ||
                      ""
                  ).trim()
              )
              .filter(Boolean)
          : [];

      const primaryImage =
        String(
          form.image ||
            ""
        ).trim();

      let finalImages =
        [
          ...images,
        ];

      if (
        primaryImage
      ) {
        finalImages =
          [
            primaryImage,
            ...finalImages.filter(
              (
                image
              ) =>
                image !==
                primaryImage
            ),
          ];
      }

      return finalImages;
    };

  // =========================================================
  // CREATE / UPDATE PRODUCT
  // =========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccessMessage(
        ""
      );

      const validationError =
        validateForm();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }

      try {
        setSaving(
          true
        );

        const token =
          getToken();

        if (!token) {
          handleAuthenticationFailure();
          return;
        }

        const productImages =
          getImagesForSave();

        const productData =
          {
            name:
              form.name.trim(),

            price:
              Number(
                form.price
              ),

            category:
              form.category.trim(),

            image:
              productImages[0] ||
              null,

            images:
              productImages,

            shortDescription:
              form.shortDescription.trim(),

            description:
              form.description.trim(),

            specifications:
              {
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

            stock:
              Number(
                form.stock
              ),

            condition:
              form.condition ||
              "Used",

            is_featured:
              form.is_featured,
          };

        const isEditing =
          Boolean(
            editingProductId
          );

        const endpoint =
          isEditing
            ? `${API_URL}/api/products/${editingProductId}`
            : `${API_URL}/api/products/`;

        const method =
          isEditing
            ? "PUT"
            : "POST";

        const response =
          await fetch(
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

              body:
                JSON.stringify(
                  productData
                ),
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
            "Access denied. Only authorized administrators can manage products."
          );

          return;
        }

        if (
          !response.ok
        ) {
          let errorMessage =
            isEditing
              ? "Unable to update product."
              : "Unable to create product.";

          try {
            const errorData =
              await response.json();

            if (
              errorData.detail
            ) {
              if (
                Array.isArray(
                  errorData.detail
                )
              ) {
                errorMessage =
                  errorData.detail
                    .map(
                      (
                        item
                      ) =>
                        item.msg ||
                        "Invalid product data."
                    )
                    .join(
                      " "
                    );
              } else {
                errorMessage =
                  errorData.detail;
              }
            }
          } catch (
            parseError
          ) {
            console.error(
              "Product save error response parsing:",
              parseError
            );
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

        const normalizedResult =
          {
            ...productResult,

            id:
              getProductId(
                productResult
              ),

            images:
              getProductImages(
                productResult
              ),
          };

        if (
          isEditing
        ) {
          setProducts(
            (
              currentProducts
            ) =>
              currentProducts.map(
                (
                  product
                ) =>
                  String(
                    getProductId(
                      product
                    )
                  ) ===
                  String(
                    editingProductId
                  )
                    ? normalizedResult
                    : product
              )
          );

          setSuccessMessage(
            "Product updated successfully."
          );
        } else {
          setProducts(
            (
              currentProducts
            ) => [
              normalizedResult,
              ...currentProducts,
            ]
          );

          setSuccessMessage(
            "Product added successfully."
          );
        }

        resetForm();
      } catch (
        submitError
      ) {
        console.error(
          "Admin product save error:",
          submitError
        );

        setError(
          submitError.message ||
            "Unable to save product."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDeleteProduct =
    async (
      productId
    ) => {
      const product =
        products.find(
          (
            item
          ) =>
            String(
              getProductId(
                item
              )
            ) ===
            String(
              productId
            )
        );

      const productName =
        product?.name ||
        "this product";

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${productName}"?`
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        setDeletingId(
          String(
            productId
          )
        );

        setError("");
        setSuccessMessage(
          ""
        );

        const token =
          getToken();

        if (!token) {
          handleAuthenticationFailure();
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/products/${productId}`,
            {
              method:
                "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,

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
            "Access denied. Only authorized administrators can delete products."
          );

          return;
        }

        if (
          !response.ok
        ) {
          let errorMessage =
            "Unable to delete product.";

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData.detail ||
              errorMessage;
          } catch (
            parseError
          ) {
            console.error(
              "Product delete response parsing:",
              parseError
            );
          }

          throw new Error(
            errorMessage
          );
        }

        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.filter(
              (
                product
              ) =>
                String(
                  getProductId(
                    product
                  )
                ) !==
                String(
                  productId
                )
            )
        );

        if (
          String(
            editingProductId
          ) ===
          String(
            productId
          )
        ) {
          resetForm();
        }

        setSuccessMessage(
          "Product deleted successfully."
        );
      } catch (
        deleteError
      ) {
        console.error(
          "Admin product delete error:",
          deleteError
        );

        setError(
          deleteError.message ||
            "Unable to delete product."
        );
      } finally {
        setDeletingId(
          ""
        );
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
            currentStock ??
              0
          )
        );

      if (
        newStock ===
        null
      ) {
        return;
      }

      if (
        newStock.trim() ===
          "" ||
        Number.isNaN(
          Number(
            newStock
          )
        ) ||
        Number(
          newStock
        ) < 0
      ) {
        setError(
          "Please enter a valid stock quantity."
        );

        return;
      }

      try {
        setUpdatingStockId(
          String(
            productId
          )
        );

        setError("");
        setSuccessMessage(
          ""
        );

        const token =
          getToken();

        if (!token) {
          handleAuthenticationFailure();
          return;
        }

        const response =
          await fetch(
            `${API_URL}/api/products/${productId}/stock`,
            {
              method:
                "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  stock:
                    Number(
                      newStock
                    ),
                }),
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
            "Access denied. Only authorized administrators can update product stock."
          );

          return;
        }

        if (
          !response.ok
        ) {
          let errorMessage =
            "Unable to update stock.";

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData.detail ||
              errorMessage;
          } catch (
            parseError
          ) {
            console.error(
              "Stock response parsing:",
              parseError
            );
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
          (
            currentProducts
          ) =>
            currentProducts.map(
              (
                product
              ) =>
                String(
                  getProductId(
                    product
                  )
                ) ===
                String(
                  getProductId(
                    updatedProduct
                  )
                )
                  ? {
                      ...updatedProduct,
                      id:
                        getProductId(
                          updatedProduct
                        ),
                      images:
                        getProductImages(
                          updatedProduct
                        ),
                    }
                  : product
            )
        );

        setSuccessMessage(
          "Product stock updated successfully."
        );
      } catch (
        stockError
      ) {
        console.error(
          "Admin product stock update error:",
          stockError
        );

        setError(
          stockError.message ||
            "Unable to update product stock."
        );
      } finally {
        setUpdatingStockId(
          ""
        );
      }
    };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency =
    (amount) => {
      return `PKR ${Number(
        amount || 0
      ).toLocaleString(
        "en-PK",
        {
          minimumFractionDigits:
            0,

          maximumFractionDigits:
            2,
        }
      )}`;
    };

  // =========================================================
  // PRODUCT IMAGE
  // =========================================================

  const renderProductImage =
    (product) => {
      const images =
        getProductImages(
          product
        );

      const image =
        images[0] ||
        product?.image ||
        "";

      if (
        image
      ) {
        const finalImageUrl =
          image.startsWith(
            "http://"
          ) ||
          image.startsWith(
            "https://"
          ) ||
          image.startsWith(
            "data:"
          ) ||
          image.startsWith(
            "blob:"
          )
            ? image
            : `${API_URL}${
                image.startsWith(
                  "/"
                )
                  ? ""
                  : "/"
              }${image}`;

        return (
          <img
            src={
              finalImageUrl
            }
            alt={
              product.name ||
              "Product"
            }
            className="admin-product-image"
            onError={(
              event
            ) => {
              event.currentTarget.style.display =
                "none";
            }}
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

  if (
    loading
  ) {
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
  // IMAGE PREVIEW LIST
  // =========================================================

  const previewImages =
    Array.isArray(
      form.images
    )
      ? form.images
      : [];

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
                    navigate(
                      "/admin"
                    )
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
                    disabled={
                      saving
                    }
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
                        value={
                          form.name
                        }
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
                        PRODUCT IMAGES
                    ========================================= */}

                    <div className="admin-products-field admin-products-field-wide">

                      <label>
                        Product Images
                      </label>

                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "10px",
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
                          Primary Image URL
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
                          Choose Multiple Images
                        </button>

                      </div>

                      {imageSource ===
                        "url" && (
                        <div>

                          <input
                            id="image"
                            name="image"
                            type="url"
                            value={
                              form.image
                            }
                            onChange={(
                              event
                            ) =>
                              handleImageUrlChange(
                                event.target.value
                              )
                            }
                            placeholder="https://example.com/product.jpg"
                            disabled={
                              saving
                            }
                          />

                          <p
                            style={{
                              margin:
                                "8px 0 0",
                              color:
                                "#64748b",
                              fontSize:
                                "12px",
                            }}
                          >
                            This will be saved as the
                            primary product image.
                            Additional images can be
                            added from the gallery.
                          </p>

                        </div>
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
                            multiple
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
                            📁 Choose Multiple Images
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
                            Select multiple images at
                            once. Each image must be
                            5 MB or smaller.
                          </p>

                          {selectedImageNames.length >
                            0 && (
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
                              ✓ Added{" "}
                              {
                                selectedImageNames.length
                              }{" "}
                              new image
                              {selectedImageNames.length !==
                              1
                                ? "s"
                                : ""}
                            </div>
                          )}

                        </div>
                      )}

                      {/* =======================================
                          IMAGE GALLERY PREVIEW
                      ======================================== */}

                      {previewImages.length >
                        0 && (
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
                                "12px",
                              flexWrap:
                                "wrap",
                            }}
                          >

                            <div>

                              <strong
                                style={{
                                  display:
                                    "block",
                                  fontSize:
                                    "14px",
                                  color:
                                    "#111827",
                                }}
                              >
                                Product Gallery
                              </strong>

                              <span
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "3px",
                                  fontSize:
                                    "12px",
                                  color:
                                    "#64748b",
                                }}
                              >
                                {
                                  previewImages.length
                                }{" "}
                                image
                                {previewImages.length !==
                                1
                                  ? "s"
                                  : ""}{" "}
                                selected
                              </span>

                            </div>

                            <button
                              type="button"
                              onClick={
                                handleClearImages
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
                              Remove All Images
                            </button>

                          </div>


                          <div
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(150px, 1fr))",
                              gap:
                                "12px",
                            }}
                          >

                            {previewImages.map(
                              (
                                image,
                                index
                              ) => {

                                const previewUrl =
                                  image.startsWith(
                                    "http://"
                                  ) ||
                                  image.startsWith(
                                    "https://"
                                  ) ||
                                  image.startsWith(
                                    "data:"
                                  ) ||
                                  image.startsWith(
                                    "blob:"
                                  )
                                    ? image
                                    : `${API_URL}${
                                        image.startsWith(
                                          "/"
                                        )
                                          ? ""
                                          : "/"
                                      }${image}`;

                                return (
                                  <div
                                    key={`${image}-${index}`}
                                    style={{
                                      position:
                                        "relative",
                                      border:
                                        index ===
                                        0
                                          ? "2px solid #111827"
                                          : "1px solid #e5e7eb",
                                      borderRadius:
                                        "10px",
                                      overflow:
                                        "hidden",
                                      background:
                                        "#f8fafc",
                                    }}
                                  >

                                    <div
                                      style={{
                                        width:
                                          "100%",
                                        height:
                                          "150px",
                                        background:
                                          "#f8fafc",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "center",
                                        overflow:
                                          "hidden",
                                      }}
                                    >
                                      <img
                                        src={
                                          previewUrl
                                        }
                                        alt={`Product ${index + 1}`}
                                        style={{
                                          width:
                                            "100%",
                                          height:
                                            "100%",
                                          objectFit:
                                            "contain",
                                        }}
                                        onError={(
                                          event
                                        ) => {
                                          event.currentTarget.style.opacity =
                                            "0.25";
                                        }}
                                      />
                                    </div>


                                    <div
                                      style={{
                                        padding:
                                          "9px",
                                      }}
                                    >

                                      <div
                                        style={{
                                          display:
                                            "flex",
                                          alignItems:
                                            "center",
                                          justifyContent:
                                            "space-between",
                                          gap:
                                            "6px",
                                          marginBottom:
                                            "8px",
                                        }}
                                      >

                                        <strong
                                          style={{
                                            fontSize:
                                              "11px",
                                            color:
                                              "#111827",
                                          }}
                                        >
                                          Image{" "}
                                          {index +
                                            1}
                                        </strong>

                                        {index ===
                                          0 && (
                                          <span
                                            style={{
                                              padding:
                                                "3px 6px",
                                              borderRadius:
                                                "999px",
                                              background:
                                                "#111827",
                                              color:
                                                "#ffffff",
                                              fontSize:
                                                "9px",
                                              fontWeight:
                                                700,
                                            }}
                                          >
                                            Primary
                                          </span>
                                        )}

                                      </div>

                                      <div
                                        style={{
                                          display:
                                            "flex",
                                          flexDirection:
                                            "column",
                                          gap:
                                            "6px",
                                        }}
                                      >

                                        {index !==
                                          0 && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMakePrimary(
                                                index
                                              )
                                            }
                                            disabled={
                                              saving
                                            }
                                            style={{
                                              width:
                                                "100%",
                                              border:
                                                "1px solid #d1d5db",
                                              background:
                                                "#ffffff",
                                              color:
                                                "#374151",
                                              borderRadius:
                                                "7px",
                                              padding:
                                                "7px 8px",
                                              fontSize:
                                                "11px",
                                              fontWeight:
                                                600,
                                              cursor:
                                                "pointer",
                                            }}
                                          >
                                            Make Primary
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveImage(
                                              index
                                            )
                                          }
                                          disabled={
                                            saving
                                          }
                                          style={{
                                            width:
                                              "100%",
                                            border:
                                              "1px solid #fecaca",
                                            background:
                                              "#fff1f2",
                                            color:
                                              "#dc2626",
                                            borderRadius:
                                              "7px",
                                            padding:
                                              "7px 8px",
                                            fontSize:
                                              "11px",
                                            fontWeight:
                                              600,
                                            cursor:
                                              "pointer",
                                          }}
                                        >
                                          Remove
                                        </button>

                                      </div>

                                    </div>

                                  </div>
                                );
                              }
                            )}

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

              {products.length ===
              0 ? (

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
                    (
                      product
                    ) => (

                      <article
                        key={
                          getProductId(
                            product
                          )
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
                              product.short_description ||
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
                                ) >
                                0
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
                                  String(
                                    getProductId(
                                      product
                                    )
                                  )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-product-stock-button"
                              onClick={() =>
                                handleStockUpdate(
                                  getProductId(
                                    product
                                  ),
                                  product.stock
                                )
                              }
                              disabled={
                                updatingStockId ===
                                  String(
                                    getProductId(
                                      product
                                    )
                                  ) ||
                                deletingId ===
                                  String(
                                    getProductId(
                                      product
                                    )
                                  )
                              }
                            >
                              {
                                updatingStockId ===
                                String(
                                  getProductId(
                                    product
                                  )
                                )
                                  ? "Updating..."
                                  : "Stock"
                              }
                            </button>

                            <button
                              type="button"
                              className="admin-product-delete-button"
                              onClick={() =>
                                handleDeleteProduct(
                                  getProductId(
                                    product
                                  )
                                )
                              }
                              disabled={
                                deletingId ===
                                  String(
                                    getProductId(
                                      product
                                    )
                                  ) ||
                                saving ||
                                updatingStockId ===
                                  String(
                                    getProductId(
                                      product
                                    )
                                  )
                              }
                            >
                              {
                                deletingId ===
                                String(
                                  getProductId(
                                    product
                                  )
                                )
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