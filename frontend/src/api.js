import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getStoredAuth = () => {
  const user = localStorage.getItem("patchit_user");
  return {
    accessToken: localStorage.getItem("patchit_access_token") || localStorage.getItem("patchit_token"),
    refreshToken: localStorage.getItem("patchit_refresh_token"),
    user: user ? JSON.parse(user) : null,
  };
};

export const storeAuth = ({ accessToken, refreshToken, user }) => {
  localStorage.setItem("patchit_access_token", accessToken);
  localStorage.setItem("patchit_token", accessToken);
  localStorage.setItem("patchit_refresh_token", refreshToken);
  localStorage.setItem("patchit_user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("patchit_access_token");
  localStorage.removeItem("patchit_token");
  localStorage.removeItem("patchit_refresh_token");
  localStorage.removeItem("patchit_user");
};

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const { accessToken } = getStoredAuth();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
