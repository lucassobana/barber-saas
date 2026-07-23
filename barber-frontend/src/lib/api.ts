import axios from 'axios';
import Cookies from 'js-cookie'; // Importamos o js-cookie

export const api = axios.create({
  baseURL: 'http://localhost:3333', // URL do nosso backend NestJS
});

// Interceptor: Antes de qualquer requisição sair, ele injeta o Token JWT
api.interceptors.request.use((config) => {
  // Agora lemos o token do Cookie, exatamente como no seu layout!
  const token = Cookies.get('barber_token'); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});