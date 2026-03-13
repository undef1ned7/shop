import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "../../axiosApi";
import type { Product } from "../../types";

export const fetchFavorites = createAsyncThunk<Product[]>(
  "favorites/fetchAll",
  async () => {
    const { data } = await axiosApi.get<Product[]>("/users/favorites");
    return data;
  },
);

export const addFavorite = createAsyncThunk<Product[], string>(
  "favorites/add",
  async (productId) => {
    const { data } = await axiosApi.post<Product[]>("/users/favorites", {
      productId,
    });
    return data;
  },
);

export const removeFavorite = createAsyncThunk<Product[], string>(
  "favorites/remove",
  async (productId) => {
    const { data } = await axiosApi.delete<Product[]>("/users/favorites", {
      data: { productId },
    });
    return data;
  },
);

