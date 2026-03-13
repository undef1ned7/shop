import { Button, Grid, MenuItem, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Product, ProductMutation } from "../../../types";
import FileInput from "../../../components/UI/FileInput/FileInput";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectCategories } from "../../categories/categoriesSlice";
import { fetchCategories } from "../../categories/categoriesThunks";

interface Props {
  onSubmit: (mutation: ProductMutation) => void;
  initial?: Product | null;
}

const ProductForm: React.FC<Props> = ({ onSubmit, initial }) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const [state, setState] = useState<ProductMutation>({
    category: initial?.category ? (typeof initial.category === "object" ? initial.category._id : initial.category) : "",
    title: initial?.title ?? "",
    price: initial?.price !== undefined ? String(initial.price) : "",
    description: initial?.description ?? "",
    image: null,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (initial) {
      setState({
        category: typeof initial.category === "object" ? initial.category._id : (initial as any).category,
        title: initial.title,
        price: String(initial.price),
        description: initial.description ?? "",
        image: null,
      });
    }
  }, [initial]);

  const submitFormHandler = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(state);
  };

  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setState((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const fileInputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: files && files[0] ? files[0] : null,
    }));
  };

  return (
    <form autoComplete="off" onSubmit={submitFormHandler}>
      <Grid container direction={"column"} spacing={2}>
        <Grid item xs>
          <TextField
            select
            id="category"
            label="Category"
            value={state.category}
            onChange={inputChangeHandler}
            name="category"
            required
          >
            <MenuItem value="" disabled>
              Please select a category
            </MenuItem>
            {categories.map((category) => (
              <MenuItem value={category._id}>{category.title}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs>
          <TextField
            id="title"
            label="title"
            value={state.title}
            onChange={inputChangeHandler}
            name="title"
            required
          />
        </Grid>
        <Grid item xs>
          <TextField
            id="price"
            label="price"
            value={state.price}
            onChange={inputChangeHandler}
            name="price"
            required
          />
        </Grid>
        <Grid item xs>
          <TextField
            multiline
            rows={3}
            id="description"
            label="description"
            value={state.description}
            onChange={inputChangeHandler}
            name="description"
          />
        </Grid>
        <Grid item xs>
          <FileInput
            onChange={fileInputChangeHandler}
            name="image"
            label="Image"
          />
        </Grid>
        <Grid item xs>
          <Button type="submit" color="primary" variant="contained">
            {initial ? "Update" : "Create"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProductForm;
