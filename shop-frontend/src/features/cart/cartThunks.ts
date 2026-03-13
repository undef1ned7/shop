import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "../../axiosApi";
import { CartResponse } from "../../types";

export const fetchCart = createAsyncThunk<CartResponse>(
  "cart/fetch",
  async () => {
    const { data } = await axiosApi.get<CartResponse>("/users/cart");
    return data;
  },
);

export const addToCart = createAsyncThunk<
  CartResponse,
  { productId: string; qty?: number }
>("cart/add", async (payload) => {
  const { data } = await axiosApi.post<CartResponse>("/users/cart", payload);
  return data;
});

export const removeFromCart = createAsyncThunk<CartResponse, string>(
  "cart/remove",
  async (productId) => {
    const { data } = await axiosApi.delete<CartResponse>("/users/cart", {
      data: { productId },
    });
    return data;
  },
);

export const clearCart = createAsyncThunk<CartResponse>(
  "cart/clear",
  async () => {
    const { data } = await axiosApi.delete<CartResponse>("/users/cart");
    return data;
  },
);

