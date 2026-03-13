import { createSlice } from "@reduxjs/toolkit";
import type { Product } from "../../types";
import { RootState } from "../../app/store";
import { addFavorite, removeFavorite, fetchFavorites } from "./favoritesThunks";

interface FavoritesState {
  items: Product[];
  loading: boolean;
}

const initialState: FavoritesState = {
  items: [],
  loading: false,
};

export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
      })
      .addCase(fetchFavorites.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addFavorite.fulfilled, (state, { payload }) => {
        state.items = payload;
      })
      .addCase(removeFavorite.fulfilled, (state, { payload }) => {
        state.items = payload;
      });
  },
});

export const favoritesReducer = favoritesSlice.reducer;
export const selectFavorites = (state: RootState) => state.favorites.items;
export const selectFavoritesLoading = (state: RootState) =>
  state.favorites.loading;

