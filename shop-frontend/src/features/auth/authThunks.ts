import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosApi from "../../axiosApi";
import { AuthResponse, RefreshResponse, User } from "../../types";
import { getStoredAuth } from "./authSlice";

export const login = createAsyncThunk<
  AuthResponse,
  { username: string; password: string }
>("auth/login", async (credentials) => {
  const { data } = await axiosApi.post<AuthResponse>("/users/login", credentials);
  return data;
});

export const register = createAsyncThunk<
  AuthResponse,
  { username: string; password: string }
>("auth/register", async (credentials) => {
  const { data } = await axiosApi.post<AuthResponse>("/users/register", credentials);
  return data;
});

export const logout = createAsyncThunk<void, void>("auth/logout", async (_, { getState }) => {
  const state = getState() as { auth: { refreshToken: string | null } };
  const refreshToken = state.auth.refreshToken;
  if (refreshToken) {
    try {
      await axiosApi.post("/users/logout", { refreshToken });
    } catch {
      // ignore
    }
  }
});

export const refreshTokens = createAsyncThunk<RefreshResponse, void>(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    const stored = getStoredAuth();
    if (!stored?.refreshToken) return rejectWithValue(null);
    try {
      const { data } = await axiosApi.post<RefreshResponse>("/users/refresh", {
        refreshToken: stored.refreshToken,
      });
      return data;
    } catch {
      return rejectWithValue(null);
    }
  }
);

export const loadStoredAuth = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string } | null,
  void
>("auth/loadStored", async () => {
  return getStoredAuth();
});
