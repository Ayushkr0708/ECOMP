import axios from 'axios';
import { ClusteringResponse } from '../../types/clustering';
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

export const clusteringApi = {
  runKMeans: async (data: any[], options: KMeansOptions): Promise<ClusteringResult> => {
    const response = await api.post<ClusteringResult>('/api/clustering/kmeans', {
      data,
      ...options,
    });
    return response.data;
  },

  runDBSCAN: async (data: any[], options: DBSCANOptions): Promise<ClusteringResult> => {
    const response = await api.post<ClusteringResult>('/api/clustering/dbscan', {
      data,
      ...options,
    });
    return response.data;
  },

  runHierarchical: async (data: any[], options: HierarchicalOptions): Promise<ClusteringResult> => {
    const response = await api.post<ClusteringResult>('/api/clustering/hierarchical', {
      data,
      ...options,
    });
    return response.data;
  },
};

export default api;