import { configureStore } from "@reduxjs/toolkit";
import { productsReducer } from "../features/products/productSlice";
import { categoriesReducer } from "../features/categories/categoriesSlice";
import { authReducer } from "../features/auth/authSlice";
import { cartReducer } from "../features/cart/cartSlice";
import { ordersReducer } from "../features/orders/ordersSlice";
import { favoritesReducer } from "../features/favorites/favoritesSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    auth: authReducer,
    cart: cartReducer,
    orders: ordersReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
