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
import BlogDetails from "./pages/BlogDetails/BlogDetails";
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
import AdminHero from "./pages/AdminHero/AdminHero";
import AdminUsers from "./pages/AdminUsers/AdminUsers";
import AdminHeaderFooter from "./pages/AdminHeaderFooter/AdminHeaderFooter";
import AdminBlogging from "./pages/AdminBlogging/AdminBlogging";

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

              <Route
                path="/blogging/:id"
                element={<BlogDetails />}
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


              {/* ==================================================
                  ADMIN DASHBOARD
                  ADMIN ONLY
              ================================================== */}

              <Route
                path="/admin"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                    ]}
                  >
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                    ]}
                  >
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />


              {/* ==================================================
                  ADMIN PRODUCTS
                  ADMIN + CO ADMIN
              ================================================== */}

              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                      "co_admin",
                    ]}
                  >
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />


              {/* ==================================================
                  ADMIN HERO
                  ADMIN ONLY
              ================================================== */}

              <Route
                path="/admin/hero"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                    ]}
                  >
                    <AdminHero />
                  </ProtectedRoute>
                }
              />


              {/* ==================================================
                  ADMIN ORDERS
                  ADMIN + CO ADMIN
              ================================================== */}

              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                      "co_admin",
                    ]}
                  >
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />


              {/* ==================================================
                  ADMIN CUSTOMER REVIEWS
                  ADMIN ONLY
              ================================================== */}

              <Route
                path="/admin/reviews"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                    ]}
                  >
                    <AdminReviews />
                  </ProtectedRoute>
                }
              />


              {/* ==================================================
                  ADMIN WHATSAPP
                  ADMIN ONLY
              ================================================== */}

              <Route
                path="/admin/whatsapp"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                    ]}
                  >
                    <AdminWhatsApp />
                  </ProtectedRoute>
                }
              />


              {/* ==================================================
                  ADMIN THEME
                  ADMIN ONLY
              ================================================== */}

              <Route
                path="/admin/theme"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                    ]}
                  >
                    <AdminTheme />
                  </ProtectedRoute>
                }
              />


              {/* ==================================================
                  ADMIN USERS / ADMIN MEMBERS
                  ADMIN ONLY
              ================================================== */}

              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                    ]}
                  >
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />


              {/* ==================================================
                  ADMIN HEADER & FOOTER
                  ADMIN ONLY
              ================================================== */}

              <Route
                path="/admin/header-footer"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                    ]}
                  >
                    <AdminHeaderFooter />
                  </ProtectedRoute>
                }
              />


              {/* ==================================================
                  ADMIN BLOGGING
                  ADMIN ONLY
              ================================================== */}

              <Route
                path="/admin/blogging"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "admin",
                    ]}
                  >
                    <AdminBlogging />
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