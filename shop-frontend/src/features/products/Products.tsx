import {
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectProducts,
  selectProductsFetching,
  selectProductsNext,
} from "./productSlice";
import { fetchProducts } from "./productsThunk";
import ProductItem from "./components/ProductItem";
import {
  selectCategories,
  selectCategoriesFetching,
} from "../categories/categoriesSlice";
import { fetchCategories } from "../categories/categoriesThunks";
import { selectUser } from "../auth/authSlice";
import { fetchFavorites } from "../favorites/favoritesThunks";

const Products = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const loading = useAppSelector(selectProductsFetching);
  const next = useAppSelector(selectProductsNext);
  const categories = useAppSelector(selectCategories);
  const categoriesLoading = useAppSelector(selectCategoriesFetching);
  const user = useAppSelector(selectUser);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("createdAt_desc");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      void dispatch(fetchFavorites());
    }
  }, [dispatch, user]);

  useEffect(() => {
    void dispatch(
      fetchProducts({
        page: 1,
        search: search || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
      }),
    );
    setPage(1);
  }, [dispatch, search, category, minPrice, maxPrice, sort]);

  const loadMore = () => {
    const nextPage = page + 1;
    void dispatch(
      fetchProducts({
        page: nextPage,
        search: search || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
      }),
    );
    setPage(nextPage);
  };

  return (
    <Grid container direction={"column"} spacing={2}>
      <Grid
        item
        container
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Grid item>
          <Typography variant="h4">Products</Typography>
        </Grid>
        <Grid item>
          {(user?.role === "admin" || user?.role === "seller") && (
            <Button color="primary" component={Link} to={"/products/new"}>
              Add product
            </Button>
          )}
        </Grid>
      </Grid>

      <Grid item>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
                disabled={categoriesLoading}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Min price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Max price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-select-label">Sort</InputLabel>
              <Select
                labelId="sort-select-label"
                value={sort}
                label="Sort"
                onChange={(e) => setSort(e.target.value)}
              >
                <MenuItem value="createdAt_desc">Newest</MenuItem>
                <MenuItem value="createdAt_asc">Oldest</MenuItem>
                <MenuItem value="price_asc">Price: low to high</MenuItem>
                <MenuItem value="price_desc">Price: high to low</MenuItem>
                <MenuItem value="title_asc">Title: A-Z</MenuItem>
                <MenuItem value="title_desc">Title: Z-A</MenuItem>
              </Select>
            </FormControl>
          </Grid>
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

      {next && (
        <Grid item sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default Products;
