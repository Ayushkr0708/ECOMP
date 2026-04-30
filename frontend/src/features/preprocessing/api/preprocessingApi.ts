import axios from 'axios';
import { PreprocessingResponse } from '../../types/preprocessing';
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