import axios from "axios";
import { getAuthToken } from "./authClient";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      console.error("Unauthorized API request:", error.config?.url, error.response?.data);
    }

    return Promise.reject(error);
  },
);

// simple response extractor
export const getData = <T>(res: any): T => res.data?.data ?? res.data;

export default api;
