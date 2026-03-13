import { createSlice } from "@reduxjs/toolkit";
import type { CartItem, CartResponse } from "../../types";
import { RootState } from "../../app/store";
import { fetchCart, addToCart, removeFromCart, clearCart } from "./cartThunks";

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  total: 0,
  loading: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.items = payload.items;
        state.total = payload.total;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, (state, { payload }) => {
        state.items = payload.items;
        state.total = payload.total;
      })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => {
        state.items = payload.items;
        state.total = payload.total;
      })
      .addCase(clearCart.fulfilled, (state, { payload }) => {
        state.items = payload.items;
        state.total = payload.total;
      });
  },
});

export const cartReducer = cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) => state.cart.total;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0);

