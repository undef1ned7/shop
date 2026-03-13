import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../../types";
import { RootState } from "../../app/store";
import { login, register, logout, refreshTokens, loadStoredAuth } from "./authThunks";

const STORAGE_KEY = "shop_auth";

export const getStoredAuth = (): { user: User; accessToken: string; refreshToken: string } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.user?.id && data?.accessToken) {
      return {
        user: { _id: data.user.id, username: data.user.username, role: data.user.role },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || "",
      };
    }
    return null;
  } catch {
    return null;
  }
};

const stored = getStoredAuth();

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loginLoading: boolean;
  registerLoading: boolean;
  logoutLoading: boolean;
}

const initialState: AuthState = {
  user: stored?.user ?? null,
  accessToken: stored?.accessToken ?? null,
  refreshToken: stored?.refreshToken ?? null,
  loginLoading: false,
  registerLoading: false,
  logoutLoading: false,
};

const saveToStorage = (state: AuthState) => {
  if (state.user && state.accessToken) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: {
          id: state.user._id,
          username: state.user.username,
          role: state.user.role,
        },
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      })
    );
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadStoredAuth.fulfilled, (state, { payload }) => {
        if (payload) {
          state.user = payload.user;
          state.accessToken = payload.accessToken;
          state.refreshToken = payload.refreshToken;
        }
      })
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loginLoading = false;
        state.user = { _id: payload.id, username: payload.username, role: payload.role };
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        saveToStorage(state);
      })
      .addCase(login.rejected, (state) => {
        state.loginLoading = false;
      })
      .addCase(register.pending, (state) => {
        state.registerLoading = true;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.registerLoading = false;
        state.user = { _id: payload.id, username: payload.username, role: payload.role };
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        saveToStorage(state);
      })
      .addCase(register.rejected, (state) => {
        state.registerLoading = false;
      })
      .addCase(logout.pending, (state) => {
        state.logoutLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        saveToStorage(state);
      })
      .addCase(logout.rejected, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        saveToStorage(state);
      })
      .addCase(refreshTokens.fulfilled, (state, { payload }) => {
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        saveToStorage(state);
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        saveToStorage(state);
      });
  },
});

export const authReducer = authSlice.reducer;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user && !!state.auth.accessToken;
export const selectLoginLoading = (state: RootState) => state.auth.loginLoading;
export const selectRegisterLoading = (state: RootState) => state.auth.registerLoading;
export const selectLogoutLoading = (state: RootState) => state.auth.logoutLoading;
