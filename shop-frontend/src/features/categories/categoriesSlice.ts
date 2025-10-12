import { createSlice } from "@reduxjs/toolkit";
import type { Category } from "../../types";
import { RootState } from "../../app/store";
import { fetchCategories } from "./categoriesThunks";
interface categoriesState {
  items: Category[];
  fetching: boolean;
}

const initialState: categoriesState = {
  items: [],
  fetching: false,
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
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
      });
  },
});

export const categoriesReducer = categoriesSlice.reducer;

export const selectCategories = (state: RootState) => state.categories.items;
export const selectCategoriesFetching = (state: RootState) =>
  state.categories.fetching;
