import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";

const api = axios.create({
  baseURL: "/api", // during dev, proxy /api to Django; in prod, adjust as needed
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem("access");

  // Axios 1.x: headers can be AxiosHeaders or a plain object -> mutate safely
  if (!config.headers) config.headers = {} as AxiosRequestHeaders;

  if (token) {
    if (typeof (config.headers as any).set === "function") {
      (config.headers as any).set("Authorization", `Bearer ${token}`);
    } else {
      (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
