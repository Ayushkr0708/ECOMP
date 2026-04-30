import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/api/auth/me');
    return response.data;
  },

  verifyToken: async (): Promise<{ valid: boolean; user_id: number }> => {
    const response = await api.post<{ valid: boolean; user_id: number }>('/api/auth/verify');
    return response.data;
  },
};

export default api;