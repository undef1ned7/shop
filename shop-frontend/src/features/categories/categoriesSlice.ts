import { createSlice } from "@reduxjs/toolkit";
import type { Category } from "../../types";
import { RootState } from "../../app/store";
import {
  fetchCategories,
  fetchOneCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoriesThunks";

interface CategoriesState {
  items: Category[];
  single: Category | null;
  fetching: boolean;
  oneLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

const initialState: CategoriesState = {
  items: [],
  single: null,
  fetching: false,
  oneLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearOneCategory: (state) => {
      state.single = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.fetching = true;
      })
      .addCase(fetchCategories.fulfilled, (state, { payload: categories }) => {
        state.items = categories;
        state.fetching = false;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.fetching = false;
      })
      .addCase(fetchOneCategory.pending, (state) => {
        state.oneLoading = true;
      })
      .addCase(fetchOneCategory.fulfilled, (state, { payload }) => {
        state.single = payload;
        state.oneLoading = false;
      })
      .addCase(fetchOneCategory.rejected, (state) => {
        state.oneLoading = false;
      })
      .addCase(createCategory.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.createLoading = false;
      })
      .addCase(createCategory.rejected, (state) => {
        state.createLoading = false;
      })
      .addCase(updateCategory.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, { meta }) => {
        state.updateLoading = false;
        const idx = state.items.findIndex((c) => c._id === meta.arg.id);
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...meta.arg.mutation };
        }
        if (state.single?._id === meta.arg.id) {
          state.single = { ...state.single, ...meta.arg.mutation };
        }
      })
      .addCase(updateCategory.rejected, (state) => {
        state.updateLoading = false;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.deleteLoading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, { meta }) => {
        state.deleteLoading = false;
        state.items = state.items.filter((c) => c._id !== meta.arg);
        if (state.single?._id === meta.arg) state.single = null;
      })
      .addCase(deleteCategory.rejected, (state) => {
        state.deleteLoading = false;
      });
  },
});

export const { clearOneCategory } = categoriesSlice.actions;
export const categoriesReducer = categoriesSlice.reducer;
export const selectCategories = (state: RootState) => state.categories.items;
export const selectCategoryOne = (state: RootState) => state.categories.single;
export const selectCategoriesFetching = (state: RootState) =>
  state.categories.fetching;
export const selectCategoryOneFetching = (state: RootState) =>
  state.categories.oneLoading;
export const selectCategoryCreateLoading = (state: RootState) =>
  state.categories.createLoading;
export const selectCategoryUpdateLoading = (state: RootState) =>
  state.categories.updateLoading;
export const selectCategoryDeleteLoading = (state: RootState) =>
  state.categories.deleteLoading;
