import axios from 'axios';
import { PreprocessingOptions, PreprocessingResult, OutlierAnalysis } from '../../types/preprocessing';
import { CustomerData } from '../../types/data';

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

export const preprocessingApi = {
  preprocessData: async (data: CustomerData[], options: PreprocessingOptions): Promise<PreprocessingResult> => {
    const response = await api.post<PreprocessingResult>('/api/preprocessing/process', {
      data,
      options,
    });
    return response.data;
  },

  analyzeOutliers: async (data: CustomerData[], columns: string[], method: string = 'iqr'): Promise<OutlierAnalysis> => {
    const response = await api.post<OutlierAnalysis>('/api/preprocessing/analyze-outliers', {
      data,
      columns,
      method,
    });
    return response.data;
  },
};

export default api;