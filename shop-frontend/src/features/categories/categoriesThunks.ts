import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "../../axiosApi";
import { Category, CategoryMutation } from "../../types";

export const fetchCategories = createAsyncThunk<Category[]>(
  "categories/fetchAll",
  async () => {
    const response = await axiosApi.get<Category[]>("/categories");
    return response.data;
  }
);

export const fetchOneCategory = createAsyncThunk<Category, string>(
  "categories/fetchOne",
  async (id) => {
    const response = await axiosApi.get<Category>(`/categories/${id}`);
    return response.data;
  }
);

export const createCategory = createAsyncThunk<void, CategoryMutation>(
  "categories/create",
  async (mutation) => {
    await axiosApi.post("/categories", mutation);
  }
);

export const updateCategory = createAsyncThunk<void, { id: string; mutation: CategoryMutation }>(
  "categories/update",
  async ({ id, mutation }) => {
    await axiosApi.patch(`/categories/${id}`, mutation);
  }
);

export const deleteCategory = createAsyncThunk<void, string>(
  "categories/delete",
  async (id) => {
    await axiosApi.delete(`/categories/${id}`);
  }
);
