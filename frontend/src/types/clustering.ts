export interface ClusterMetrics {
  silhouette_score: number;
  calinski_harabasz: number;
  davies_bouldin: number;
  n_clusters: number;
  n_noise: number;
}

export interface ClusterProfile {
  size: number;
  percentage: number;
  top_characteristics: {
    feature: string;
    cluster_mean: number;
    diff_from_avg: number;
  }[];
  [key: string]: any;
}

export interface ClusteringResult {
  algorithm: string;
  labels: number[];
  centers: number[][];
  metrics: ClusterMetrics;
  cluster_sizes: Record<string, number>;
  cluster_profiles: Record<string, ClusterProfile>;
  feature_names: string[];
}

export interface KMeansOptions {
  n_clusters: number;
  find_optimal: boolean;
}

export interface DBSCANOptions {
  eps: number;
  min_samples: number;
}

export interface HierarchicalOptions {
  n_clusters: number;
  linkage: 'ward' | 'complete' | 'average' | 'single';
}