import axios from "axios";
import { parseCookies } from "nookies"; // Usando nookies para padronizar

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
});

api.interceptors.request.use((config) => {
  // Lemos o token com a mesma chave salva no AuthContext
  const { "@BarberSaaS:token": token } = parseCookies();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
