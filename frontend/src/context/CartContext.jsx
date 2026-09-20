import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "tfortech_cart";

/*
  ============================================================
  LOAD INITIAL CART
  ============================================================
  Safely load cart data from localStorage.

  If localStorage is empty, corrupted, or contains invalid data,
  the application will simply start with an empty cart.
*/
const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart
      .filter(
        (item) =>
          item &&
          item.id !== undefined &&
          item.id !== null
      )
      .map((item) => ({
        ...item,
        quantity: Math.max(
          1,
          Number(item.quantity) || 1
        ),
      }));
  } catch (error) {
    console.error("Unable to load cart:", error);
    return [];
  }
};

/*
  ============================================================
  CART PROVIDER
  ============================================================
*/
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getInitialCart);

  /*
    ==========================================================
    SAVE CART TO LOCAL STORAGE
    ==========================================================
    Whenever cartItems changes, save the latest cart.
  */
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error("Unable to save cart:", error);
    }
  }, [cartItems]);

  /*
    ============================================================
    ADD TO CART
    ============================================================
    If the product already exists:
      quantity increases.

    If the product doesn't exist:
      a new item is added.

    Stock is respected when stock information exists.
  */
  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (
        !product ||
        product.id === undefined ||
        product.id === null
      ) {
        console.error(
          "Invalid product supplied to addToCart."
        );
        return;
      }

      const requestedQuantity = Math.max(
        1,
        Number(quantity) || 1
      );

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) =>
            String(item.id) === String(product.id)
        );

        /*
          Product already exists
        */
        if (existingItem) {
          const stock =
            typeof existingItem.stock === "number"
              ? existingItem.stock
              : typeof product.stock === "number"
              ? product.stock
              : Infinity;

          const newQuantity = Math.min(
            existingItem.quantity + requestedQuantity,
            stock
          );

          return currentItems.map((item) =>
            String(item.id) === String(product.id)
              ? {
                  ...item,
                  ...product,
                  quantity: newQuantity,
                }
              : item
          );
        }

        /*
          New product
        */
        const stock =
          typeof product.stock === "number"
            ? product.stock
            : Infinity;

        const finalQuantity = Math.min(
          requestedQuantity,
          stock
        );

        return [
          ...currentItems,
          {
            ...product,
            quantity: finalQuantity,
          },
        ];
      });
    },
    []
  );

  /*
    ============================================================
    REMOVE FROM CART
    ============================================================
  */
  const removeFromCart = useCallback(
    (productId) => {
      setCartItems((currentItems) =>
        currentItems.filter(
          (item) =>
            String(item.id) !== String(productId)
        )
      );
    },
    []
  );

  /*
    ============================================================
    INCREASE QUANTITY
    ============================================================
    Quantity cannot exceed available stock.
  */
  const increaseQuantity = useCallback(
    (productId) => {
      setCartItems((currentItems) =>
        currentItems.map((item) => {
          if (
            String(item.id) !== String(productId)
          ) {
            return item;
          }

          const stock =
            typeof item.stock === "number"
              ? item.stock
              : Infinity;

          const newQuantity = Math.min(
            item.quantity + 1,
            stock
          );

          return {
            ...item,
            quantity: newQuantity,
          };
        })
      );
    },
    []
  );

  /*
    ============================================================
    DECREASE QUANTITY
    ============================================================
    If quantity becomes 0, the product is removed.
  */
  const decreaseQuantity = useCallback(
    (productId) => {
      setCartItems((currentItems) =>
        currentItems
          .map((item) => {
            if (
              String(item.id) !== String(productId)
            ) {
              return item;
            }

            return {
              ...item,
              quantity: item.quantity - 1,
            };
          })
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  /*
    ============================================================
    UPDATE EXACT QUANTITY
    ============================================================
    Useful if later we add a direct quantity input field.
  */
  const updateQuantity = useCallback(
    (productId, quantity) => {
      const requestedQuantity = Number(quantity);

      if (!Number.isFinite(requestedQuantity)) {
        return;
      }

      setCartItems((currentItems) =>
        currentItems
          .map((item) => {
            if (
              String(item.id) !== String(productId)
            ) {
              return item;
            }

            const stock =
              typeof item.stock === "number"
                ? item.stock
                : Infinity;

            const finalQuantity = Math.min(
              Math.max(
                1,
                Math.floor(requestedQuantity)
              ),
              stock
            );

            return {
              ...item,
              quantity: finalQuantity,
            };
          })
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  /*
    ============================================================
    CLEAR CART
    ============================================================
  */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /*
    ============================================================
    CHECK PRODUCT IN CART
    ============================================================
  */
  const isInCart = useCallback(
    (productId) => {
      return cartItems.some(
        (item) =>
          String(item.id) === String(productId)
      );
    },
    [cartItems]
  );

  /*
    ============================================================
    GET PRODUCT QUANTITY
    ============================================================
  */
  const getItemQuantity = useCallback(
    (productId) => {
      const item = cartItems.find(
        (cartItem) =>
          String(cartItem.id) ===
          String(productId)
      );

      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  /*
    ============================================================
    TOTAL ITEMS
    ============================================================
    Example:

    Laptop x2
    Mouse x1

    totalItems = 3
  */
  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  /*
    ============================================================
    CART COUNT
    ============================================================
    Number of different products.

    Example:

    Laptop x2
    Mouse x1

    cartCount = 2
  */
  const cartCount = cartItems.length;

  /*
    ============================================================
    SUBTOTAL
    ============================================================
  */
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 0);

      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  /*
    ============================================================
    DELIVERY
    ============================================================
    Current temporary frontend rule:

    PKR 50,000 or more
      = FREE DELIVERY

    Below PKR 50,000
      = PKR 500 delivery

    Later this can be moved to backend/admin settings.
  */
  const delivery = useMemo(() => {
    if (cartItems.length === 0) {
      return 0;
    }

    return subtotal >= 50000 ? 0 : 500;
  }, [cartItems.length, subtotal]);

  /*
    ============================================================
    GRAND TOTAL
    ============================================================
  */
  const grandTotal = useMemo(() => {
    return subtotal + delivery;
  }, [subtotal, delivery]);

  /*
    ============================================================
    CART CONTEXT VALUE
    ============================================================
  */
  const value = useMemo(
    () => ({
      // Cart data
      cartItems,

      // Cart actions
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      updateQuantity,
      clearCart,

      // Product helpers
      isInCart,
      getItemQuantity,

      // Calculated values
      totalItems,
      cartCount,
      subtotal,
      delivery,
      grandTotal,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity,
      totalItems,
      cartCount,
      subtotal,
      delivery,
      grandTotal,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

/*
  ============================================================
  USE CART HOOK
  ============================================================

  Any component can now use:

  const {
    cartItems,
    addToCart,
    removeFromCart,
    totalItems,
    subtotal
  } = useCart();
*/
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside a CartProvider."
    );
  }

  return context;
};

export default CartContext;