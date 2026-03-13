import { Container, CssBaseline } from "@mui/material";
import React from "react";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./features/products/Products";
import NewProduct from "./features/products/NewProduct";
import EditProduct from "./features/products/EditProduct";
import Categories from "./features/categories/Categories";
import NewCategory from "./features/categories/NewCategory";
import EditCategory from "./features/categories/EditCategory";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Profile from "./features/profile/Profile";
import ChangePassword from "./features/auth/ChangePassword";
import Cart from "./features/cart/Cart";
import Orders from "./features/orders/Orders";
import AdminUsers from "./features/admin/AdminUsers";

const App = () => {
  return (
    <>
      <CssBaseline />
      <header>
        <AppToolbar />
      </header>
      <main>
        <Container maxWidth="xl">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Products />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/products/new" element={<NewProduct />} />
              <Route path="/products/:id/edit" element={<EditProduct />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/new" element={<NewCategory />} />
              <Route path="/categories/:id/edit" element={<EditCategory />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </main>
    </>
  );
};

export default App;
