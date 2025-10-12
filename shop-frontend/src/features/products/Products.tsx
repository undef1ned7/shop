import { Button, Grid, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectProducts } from "./productSlice";
import { fetchProducts } from "./productsThunk";
import ProductItem from "./components/ProductItem";

const Products = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <Grid container direction={"column"} spacing={2}>
      <Grid
        item
        container
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Grid item>
          <Typography variant="h4">products</Typography>
        </Grid>
        <Grid item>
          <Button color="primary" component={Link} to={"/products/new"}>
            Add product
          </Button>
        </Grid>
      </Grid>
      <Grid item container spacing={2}>
        {products.map((product) => (
          <ProductItem
            key={product._id}
            categoryTitle={product.category?.title}
            title={product.title}
            price={product.price}
            id={product._id}
            image={product.image}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default Products;
