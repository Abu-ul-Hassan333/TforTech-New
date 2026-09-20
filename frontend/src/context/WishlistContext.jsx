import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = "tfortech_wishlist";

// ============================================================
// GET PRODUCT ID
// ============================================================

const getProductId = (product) => {
  if (!product) {
    return null;
  }

  return product.id || product._id || null;
};

// ============================================================
// GET INITIAL WISHLIST
// ============================================================

const getInitialWishlist = () => {
  try {
    const savedWishlist = localStorage.getItem(
      WISHLIST_STORAGE_KEY
    );

    if (!savedWishlist) {
      return [];
    }

    const parsedWishlist = JSON.parse(savedWishlist);

    if (!Array.isArray(parsedWishlist)) {
      return [];
    }

    return parsedWishlist;
  } catch (error) {
    console.error(
      "Failed to load wishlist from localStorage:",
      error
    );

    return [];
  }
};

// ============================================================
// WISHLIST PROVIDER
// ============================================================

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(
    getInitialWishlist
  );

  // ==========================================================
  // SAVE WISHLIST
  // ==========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlistItems)
      );
    } catch (error) {
      console.error(
        "Failed to save wishlist to localStorage:",
        error
      );
    }
  }, [wishlistItems]);

  // ==========================================================
  // ADD TO WISHLIST
  // ==========================================================

  const addToWishlist = useCallback((product) => {
    if (!product) {
      return;
    }

    const productId = getProductId(product);

    if (!productId) {
      console.warn(
        "Cannot add product to wishlist: product ID is missing."
      );

      return;
    }

    setWishlistItems((previousItems) => {
      const alreadyExists = previousItems.some(
        (item) => getProductId(item) === productId
      );

      if (alreadyExists) {
        return previousItems;
      }

      return [
        ...previousItems,
        product,
      ];
    });
  }, []);

  // ==========================================================
  // REMOVE FROM WISHLIST
  // ==========================================================

  const removeFromWishlist = useCallback((productId) => {
    if (!productId) {
      return;
    }

    setWishlistItems((previousItems) =>
      previousItems.filter(
        (item) => getProductId(item) !== productId
      )
    );
  }, []);

  // ==========================================================
  // TOGGLE WISHLIST
  // ==========================================================

  const toggleWishlist = useCallback((product) => {
    if (!product) {
      return;
    }

    const productId = getProductId(product);

    if (!productId) {
      return;
    }

    setWishlistItems((previousItems) => {
      const alreadyExists = previousItems.some(
        (item) => getProductId(item) === productId
      );

      if (alreadyExists) {
        return previousItems.filter(
          (item) => getProductId(item) !== productId
        );
      }

      return [
        ...previousItems,
        product,
      ];
    });
  }, []);

  // ==========================================================
  // CHECK IF PRODUCT IS IN WISHLIST
  // ==========================================================

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) {
        return false;
      }

      return wishlistItems.some(
        (item) => getProductId(item) === productId
      );
    },
    [wishlistItems]
  );

  // ==========================================================
  // GET WISHLIST ITEM
  // ==========================================================

  const getWishlistItem = useCallback(
    (productId) => {
      if (!productId) {
        return null;
      }

      return (
        wishlistItems.find(
          (item) => getProductId(item) === productId
        ) || null
      );
    },
    [wishlistItems]
  );

  // ==========================================================
  // CLEAR WISHLIST
  // ==========================================================

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  // ==========================================================
  // WISHLIST COUNT
  // ==========================================================

  const wishlistCount = wishlistItems.length;

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount,

      addToWishlist,
      removeFromWishlist,
      toggleWishlist,

      isInWishlist,
      getWishlistItem,

      clearWishlist,
    }),
    [
      wishlistItems,
      wishlistCount,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      getWishlistItem,
      clearWishlist,
    ]
  );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// ============================================================
// USE WISHLIST HOOK
// ============================================================

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider."
    );
  }

  return context;
};