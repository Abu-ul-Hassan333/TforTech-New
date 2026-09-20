import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./context/ThemeContext";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import FloatingWhatsApp from "./components/FloatingWhatsApp/FloatingWhatsApp";

import Home from "./pages/Home";
import Products from "./pages/Products/Products";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Blogging from "./pages/Blogging/Blogging";
import Categories from "./pages/Categories/Categories";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Wishlist from "./pages/Wishlist/Wishlist";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Account from "./pages/Account/Account";
import Orders from "./pages/Orders/Orders";

import AdminOrders from "./pages/AdminOrders/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminProducts from "./pages/AdminProducts/AdminProducts";
import AdminWhatsApp from "./pages/AdminWhatsApp/AdminWhatsApp";
import AdminTheme from "./pages/AdminTheme/AdminTheme";
import AdminReviews from "./pages/AdminReviews/AdminReviews";

import CustomerReviews from "./pages/CustomerReviews/CustomerReviews";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>

              {/* =========================
                  HOME
              ========================== */}

              <Route
                path="/"
                element={<Home />}
              />


              {/* =========================
                  PRODUCTS
              ========================== */}

              <Route
                path="/products"
                element={<Products />}
              />

              <Route
                path="/products/:id"
                element={<ProductDetails />}
              />


              {/* =========================
                  BLOGGING
              ========================== */}

              <Route
                path="/blogging"
                element={<Blogging />}
              />


              {/* =========================
                  CATEGORIES
              ========================== */}

              <Route
                path="/categories"
                element={<Categories />}
              />

              <Route
                path="/categories/hp"
                element={<Categories />}
              />

              <Route
                path="/categories/dell"
                element={<Categories />}
              />

              <Route
                path="/categories/lenovo"
                element={<Categories />}
              />

              <Route
                path="/categories/macbook"
                element={<Categories />}
              />


              {/* =========================
                  ABOUT
              ========================== */}

              <Route
                path="/about"
                element={<About />}
              />


              {/* =========================
                  CONTACT
              ========================== */}

              <Route
                path="/contact"
                element={<Contact />}
              />


              {/* =========================
                  CUSTOMER REVIEWS
              ========================== */}

              <Route
                path="/reviews"
                element={<CustomerReviews />}
              />


              {/* =========================
                  CART
              ========================== */}

              <Route
                path="/cart"
                element={<Cart />}
              />


              {/* =========================
                  WISHLIST
              ========================== */}

              <Route
                path="/wishlist"
                element={<Wishlist />}
              />


              {/* =========================
                  CHECKOUT
              ========================== */}

              <Route
                path="/checkout"
                element={<Checkout />}
              />


              {/* =========================
                  LOGIN
              ========================== */}

              <Route
                path="/login"
                element={<Login />}
              />


              {/* =========================
                  REGISTER
              ========================== */}

              <Route
                path="/register"
                element={<Register />}
              />


              {/* =========================
                  CUSTOMER ACCOUNT
              ========================== */}

              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />


              {/* =========================
                  CUSTOMER ORDERS
              ========================== */}

              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />


              {/* =========================
                  ADMIN DASHBOARD
              ========================== */}

              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />


              {/* =========================
                  ADMIN PRODUCTS
              ========================== */}

              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />


              {/* =========================
                  ADMIN ORDERS
              ========================== */}

              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />


              {/* =========================
                  ADMIN CUSTOMER REVIEWS
              ========================== */}

              <Route
                path="/admin/reviews"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminReviews />
                  </ProtectedRoute>
                }
              />


              {/* =========================
                  ADMIN WHATSAPP
              ========================== */}

              <Route
                path="/admin/whatsapp"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminWhatsApp />
                  </ProtectedRoute>
                }
              />


              {/* =========================
                  ADMIN THEME
              ========================== */}

              <Route
                path="/admin/theme"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminTheme />
                  </ProtectedRoute>
                }
              />

            </Routes>


            {/* =========================
                FLOATING WHATSAPP
            ========================== */}

            <FloatingWhatsApp />

          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;