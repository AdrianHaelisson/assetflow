import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
});

// Request interceptor — inject bearer token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const addToast = useToastStore.getState().add;

    if (status === 401) {
      useAuthStore.getState().logout();
      addToast({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
    } else if (status === 403) {
      addToast({ type: 'error', message: 'Você não tem permissão para esta ação.' });
    } else if (status === 404) {
      addToast({ type: 'warning', message: 'Recurso não encontrado.' });
    } else if (status >= 500) {
      addToast({ type: 'error', message: 'Erro interno do servidor. Tente novamente.' });
    }

    return Promise.reject(error);
  }
);
