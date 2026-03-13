import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "../../axiosApi";
import { Product, ProductMutation, ProductsListResponse } from "../../types";

export interface FetchProductsParams {
  page?: number;
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

export const fetchProducts = createAsyncThunk<
  ProductsListResponse,
  FetchProductsParams | undefined
>("products/fetchAll", async (params) => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.minPrice) query.set("minPrice", params.minPrice);
  if (params?.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params?.sort) query.set("sort", params.sort);

  const queryString = query.toString();
  const url = queryString ? `/products?${queryString}` : "/products";

  const response = await axiosApi.get<ProductsListResponse>(url);
  return response.data;
});

export const fetchOneProduct = createAsyncThunk<Product, string>(
  "products/fetchOne",
  async (id) => {
    const response = await axiosApi.get<Product>(`/products/${id}`);
    return response.data;
  }
);

export const createProduct = createAsyncThunk<void, ProductMutation>(
  "products/create",
  async (productMutation) => {
    const formData = new FormData();
    const keys = Object.keys(productMutation) as (keyof ProductMutation)[];

    keys.forEach((key) => {
      const value = productMutation[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value as string | Blob);
      }
    });

    await axiosApi.post("/products", formData);
  }
);

export const updateProduct = createAsyncThunk<void, { id: string; mutation: ProductMutation }>(
  "products/update",
  async ({ id, mutation }) => {
    const formData = new FormData();
    const keys = Object.keys(mutation) as (keyof ProductMutation)[];
    keys.forEach((key) => {
      const value = mutation[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value as string | Blob);
      }
    });
    await axiosApi.patch(`/products/${id}`, formData);
  }
);

export const deleteProduct = createAsyncThunk<void, string>(
  "products/delete",
  async (id) => {
    await axiosApi.delete(`/products/${id}`);
  }
);
