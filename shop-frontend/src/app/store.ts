import { configureStore } from "@reduxjs/toolkit";
import { productsReducer } from "../features/products/productSlice";
import { categoriesReducer } from "../features/categories/categoriesSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
