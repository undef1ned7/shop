import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "../../axiosApi";
import { Order } from "../../types";

export const createOrder = createAsyncThunk<Order>(
  "orders/create",
  async () => {
    const { data } = await axiosApi.post<Order>("/orders");
    return data;
  },
);

export const fetchOrders = createAsyncThunk<Order[]>(
  "orders/fetchAll",
  async () => {
    const { data } = await axiosApi.get<Order[]>("/orders");
    return data;
  },
);

export const updateOrderStatus = createAsyncThunk<
  Order,
  { orderId: string; status: Order["status"] }
>("orders/updateStatus", async ({ orderId, status }) => {
  const { data } = await axiosApi.patch<Order>(`/orders/${orderId}/status`, {
    status,
  });
  return data;
});

