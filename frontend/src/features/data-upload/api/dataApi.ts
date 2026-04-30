import axios from 'axios';
import { DataUploadResponse, SavedFile, LoadDataResponse } from '../../types/data';
import { API_BASE_URL } from '../../../config';

const api = axios.create({
  baseURL: API_BASE_URL,
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

export const dataApi = {
  uploadCsv: async (file: File): Promise<DataUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<DataUploadResponse>('/api/data/upload', formData);
    return response.data;
  },

  generateSynthetic: async (numCustomers: number = 1000): Promise<DataUploadResponse> => {
    const response = await api.post<DataUploadResponse>('/api/data/generate', {
      num_customers: numCustomers,
    });
    return response.data;
  },

  getSavedFiles: async (): Promise<{ files: SavedFile[] }> => {
    const response = await api.get<{ files: SavedFile[] }>('/api/data/files');
    return response.data;
  },

  loadData: async (filepath: string): Promise<LoadDataResponse> => {
    const response = await api.post<LoadDataResponse>('/api/data/load', {
      filepath,
    });
    return response.data;
  },
};

export default api;