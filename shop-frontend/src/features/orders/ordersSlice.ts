import { createSlice } from "@reduxjs/toolkit";
import type { Order } from "../../types";
import { RootState } from "../../app/store";
import { createOrder, fetchOrders, updateOrderStatus } from "./ordersThunks";

interface OrdersState {
  items: Order[];
  fetchLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
}

const initialState: OrdersState = {
  items: [],
  fetchLoading: false,
  createLoading: false,
  updateLoading: false,
};

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.fetchLoading = false;
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.fetchLoading = false;
      })
      .addCase(createOrder.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.createLoading = false;
        // Добавляем новый заказ в начало списка
        state.items = [payload, ...state.items];
      })
      .addCase(createOrder.rejected, (state) => {
        state.createLoading = false;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        state.updateLoading = false;
        state.items = state.items.map((order) =>
          order._id === payload._id ? payload : order,
        );
      })
      .addCase(updateOrderStatus.rejected, (state) => {
        state.updateLoading = false;
      });
  },
});

export const ordersReducer = ordersSlice.reducer;

export const selectOrders = (state: RootState) => state.orders.items;
export const selectOrdersFetching = (state: RootState) =>
  state.orders.fetchLoading;
export const selectOrderCreating = (state: RootState) =>
  state.orders.createLoading;
export const selectOrderUpdating = (state: RootState) =>
  state.orders.updateLoading;

