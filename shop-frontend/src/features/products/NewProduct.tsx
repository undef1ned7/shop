import { Typography } from "@mui/material";
import React from "react";
import ProductForm from "./components/ProductForm";
import { useAppDispatch } from "../../app/hooks";
import { useNavigate } from "react-router-dom";
import { ProductMutation } from "../../types";
import { createProduct } from "./productsThunk";

const NewProduct = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onFormSubmit = async (productMutation: ProductMutation) => {
    try {
      await dispatch(createProduct(productMutation)).unwrap();
      navigate("/");
    } catch (e) {
      //
    }
  };

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        New product
      </Typography>
      <ProductForm onSubmit={onFormSubmit} />
    </>
  );
};

export default NewProduct;
