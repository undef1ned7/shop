import axios from "axios";
import { apiURL } from "./constants";

const STORAGE_KEY = "shop_auth";

const getAccessToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.accessToken ?? null;
  } catch {
    return null;
  }
};

const getRefreshToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.refreshToken ?? null;
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const setAuthStorage = (accessToken: string, refreshToken: string) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    data.accessToken = accessToken;
    data.refreshToken = refreshToken;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    //
  }
};

const axiosApi = axios.create({
  baseURL: apiURL,
});

axiosApi.interceptors.request.use((config) => {
  const isAuthEndpoint =
    config.url === "/users/login" ||
    config.url === "/users/register" ||
    config.url === "/users/refresh";
  if (!isAuthEndpoint) {
    const token = getAccessToken();
    if (token && config.headers && typeof config.headers === "object") {
      (config.headers as Record<string, string>).Authorization = "Bearer " + token;
    }
  }
  return config;
});

let refreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, newToken: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(newToken);
    }
  });
  failedQueue = [];
};

axiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      if (error.response?.status === 401) {
        clearAuthStorage();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (refreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (value) => {
            if (value && originalRequest.headers && typeof originalRequest.headers === "object") {
              (originalRequest.headers as Record<string, string>).Authorization = "Bearer " + value;
            }
            resolve(axiosApi(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    refreshing = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthStorage();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(apiURL + "/users/refresh", {
        refreshToken,
      });
      setAuthStorage(data.accessToken, data.refreshToken);
      if (originalRequest.headers && typeof originalRequest.headers === "object") {
        (originalRequest.headers as Record<string, string>).Authorization = "Bearer " + data.accessToken;
      }
      processQueue(null, data.accessToken);
      return axiosApi(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthStorage();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  }
);

export default axiosApi;
