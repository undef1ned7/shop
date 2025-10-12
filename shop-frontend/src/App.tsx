import { Container, CssBaseline } from "@mui/material";
import React from "react";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Route, Routes } from "react-router-dom";
import Products from "./features/products/Products";
import NewProduct from "./features/products/NewProduct";

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
            <Route path="/" element={<Products />} />
            <Route path="/products/new" element={<NewProduct />} />
          </Routes>
        </Container>
      </main>
    </>
  );
};

export default App;
