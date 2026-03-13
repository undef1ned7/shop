import { createSlice } from "@reduxjs/toolkit";
import type { Product, ProductsListResponse } from "../../types";
import { RootState } from "../../app/store";
import { createProduct, fetchProducts, fetchOneProduct, updateProduct, deleteProduct } from "./productsThunk";

interface ProductsState {
  items: Product[];
  single: Product | null;
  fetchLoading: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  createLoading: boolean;
  oneLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

const initialState: ProductsState = {
  items: [],
  single: null,
  fetchLoading: false,
  count: 0,
  next: null,
  previous: null,
  createLoading: false,
  oneLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearOneProduct: (state) => {
      state.single = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.fetchLoading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, { payload, meta }) => {
      const { results, count, next, previous } = payload as ProductsListResponse;
      const page = meta.arg?.page ?? 1;
      if (page > 1) {
        state.items = [...state.items, ...results];
      } else {
        state.items = results;
      }
      state.count = count;
      state.next = next;
      state.previous = previous;
      state.fetchLoading = false;
    });
    builder.addCase(fetchProducts.rejected, (state) => {
      state.fetchLoading = false;
    });

    builder.addCase(fetchOneProduct.pending, (state) => {
      state.oneLoading = true;
    });
    builder.addCase(fetchOneProduct.fulfilled, (state, { payload }) => {
      state.single = payload;
      state.oneLoading = false;
    });
    builder.addCase(fetchOneProduct.rejected, (state) => {
      state.oneLoading = false;
    });

    builder.addCase(createProduct.pending, (state) => {
      state.createLoading = true;
    });
    builder.addCase(createProduct.fulfilled, (state) => {
      state.createLoading = false;
    });
    builder.addCase(createProduct.rejected, (state) => {
      state.createLoading = false;
    });

    builder.addCase(updateProduct.pending, (state) => {
      state.updateLoading = true;
    });
    builder.addCase(updateProduct.fulfilled, (state) => {
      state.updateLoading = false;
    });
    builder.addCase(updateProduct.rejected, (state) => {
      state.updateLoading = false;
    });

    builder.addCase(deleteProduct.pending, (state) => {
      state.deleteLoading = true;
    });
    builder.addCase(deleteProduct.fulfilled, (state, { meta }) => {
      state.deleteLoading = false;
      state.items = state.items.filter((p) => p._id !== meta.arg);
      if (state.single?._id === meta.arg) state.single = null;
    });
    builder.addCase(deleteProduct.rejected, (state) => {
      state.deleteLoading = false;
    });
  },
});

export const { clearOneProduct } = productsSlice.actions;
export const productsReducer = productsSlice.reducer;
export const selectProducts = (state: RootState) => state.products.items;
export const selectProductOne = (state: RootState) => state.products.single;
export const selectProductsFetching = (state: RootState) =>
  state.products.fetchLoading;
export const selectProductCreating = (state: RootState) =>
  state.products.createLoading;
export const selectProductOneFetching = (state: RootState) =>
  state.products.oneLoading;
export const selectProductUpdateLoading = (state: RootState) =>
  state.products.updateLoading;
export const selectProductDeleteLoading = (state: RootState) =>
  state.products.deleteLoading;
export const selectProductsCount = (state: RootState) => state.products.count;
export const selectProductsNext = (state: RootState) => state.products.next;
export const selectProductsPrevious = (state: RootState) =>
  state.products.previous;
