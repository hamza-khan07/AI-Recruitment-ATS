import axios from "axios";
import { getAuthToken, saveAuthToken, getRefreshToken, removeAuthToken } from "./authClient";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = getAuthToken();
  if (!token) return config;

  if (config.headers && typeof config.headers.set === 'function') {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto-refresh token on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token — force logout
        removeAuthToken();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${baseURL}/api/v1/auth/refresh`, { refreshToken });
        const newAccessToken = res.data?.data?.accessToken;

        saveAuthToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeAuthToken();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// simple response extractor
export const getData = <T>(res: any): T => res.data?.data ?? res.data;

export default api;
