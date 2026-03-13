import { Typography } from "@mui/material";
import React, { useEffect } from "react";
import ProductForm from "./components/ProductForm";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { ProductMutation } from "../../types";
import { fetchOneProduct, updateProduct } from "./productsThunk";
import { selectProductOne, selectProductOneFetching, selectProductUpdateLoading } from "./productSlice";
import { CircularProgress } from "@mui/material";

const EditProduct = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const product = useAppSelector(selectProductOne);
  const loading = useAppSelector(selectProductOneFetching);
  const updateLoading = useAppSelector(selectProductUpdateLoading);

  useEffect(() => {
    if (id) dispatch(fetchOneProduct(id));
  }, [dispatch, id]);

  const onFormSubmit = async (productMutation: ProductMutation) => {
    if (!id) return;
    try {
      await dispatch(updateProduct({ id, mutation: productMutation })).unwrap();
      navigate("/");
    } catch (e) {
      //
    }
  };

  if (loading || !product) {
    return (
      <Typography component="div" sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Edit product
      </Typography>
      <ProductForm onSubmit={onFormSubmit} initial={product} />
      {updateLoading && (
        <Typography component="div" sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress size={24} />
        </Typography>
      )}
    </>
  );
};

export default EditProduct;
