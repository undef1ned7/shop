import { Button, Grid, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCategories } from "./categoriesSlice";
import { fetchCategories } from "./categoriesThunks";
import CategoryItem from "./components/CategoryItem";
import { selectUser } from "../auth/authSlice";

const Categories = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h4">Categories</Typography>
        </Grid>
        <Grid item>
          {(user?.role === "admin" || user?.role === "seller") && (
            <Button
              color="primary"
              component={Link}
              to="/categories/new"
              variant="contained"
            >
              Add category
            </Button>
          )}
        </Grid>
      </Grid>
      <Grid item container spacing={2}>
        {categories.map((category) => (
          <CategoryItem
            key={category._id}
            id={category._id}
            title={category.title}
            description={category.description}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default Categories;
