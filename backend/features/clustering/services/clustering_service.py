import pandas as pd
import numpy as np
from ..utils.kmeans import run_kmeans, find_optimal_k
from ..utils.dbscan import run_dbscan, find_optimal_eps
from ..utils.hierarchical import run_hierarchical, get_dendrogram_data

class ClusteringService:
    @staticmethod
    def cluster_kmeans(data: list, n_clusters: int = 3, find_optimal: bool = False) -> dict:
        df = pd.DataFrame(data)
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if not numeric_cols:
            return {'error': 'No numeric columns found for clustering'}
        
        X = df[numeric_cols].values
        
        if find_optimal:
            k_results = find_optimal_k(X)
            return {
                'optimal_k_results': k_results,
                'recommended_k': max(k_results, key=lambda x: x['silhouette'])['k'] if k_results else n_clusters
            }
        
        result = run_kmeans(X, n_clusters)
        
        df['cluster'] = result['labels']
        
        cluster_profiles = ClusteringService._get_cluster_profiles(df, numeric_cols, result['labels'])
        
        return {
            'algorithm': 'K-Means',
            'n_clusters': n_clusters,
            'labels': result['labels'],
            'centers': result['centers'],
            'metrics': result['metrics'],
            'cluster_sizes': result['cluster_sizes'],
            'cluster_profiles': cluster_profiles,
            'feature_names': numeric_cols
        }
    
    @staticmethod
    def cluster_dbscan(data: list, eps: float = 0.5, min_samples: int = 5) -> dict:
        df = pd.DataFrame(data)
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if not numeric_cols:
            return {'error': 'No numeric columns found for clustering'}
        
        X = df[numeric_cols].values
        
        result = run_dbscan(X, eps, min_samples)
        
        df['cluster'] = result['labels']
        
        non_noise = df[df['cluster'] != -1]
        if len(non_noise) > 0:
            cluster_profiles = ClusteringService._get_cluster_profiles(non_noise, numeric_cols, non_noise['cluster'].values)
        else:
            cluster_profiles = {}
        
        return {
            'algorithm': 'DBSCAN',
            'eps': eps,
            'min_samples': min_samples,
            'labels': result['labels'],
            'centers': result['centers'],
            'metrics': result['metrics'],
            'cluster_sizes': result['cluster_sizes'],
            'cluster_profiles': cluster_profiles,
            'feature_names': numeric_cols
        }
    
    @staticmethod
    def cluster_hierarchical(data: list, n_clusters: int = 3, linkage: str = 'ward') -> dict:
        df = pd.DataFrame(data)
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if not numeric_cols:
            return {'error': 'No numeric columns found for clustering'}
        
        X = df[numeric_cols].values
        
        result = run_hierarchical(X, n_clusters, linkage)
        
        df['cluster'] = result['labels']
        
        cluster_profiles = ClusteringService._get_cluster_profiles(df, numeric_cols, result['labels'])
        
        dendrogram_data = get_dendrogram_data(X, linkage)
        
        return {
            'algorithm': 'Hierarchical',
            'n_clusters': n_clusters,
            'linkage': linkage,
            'labels': result['labels'],
            'centers': result['centers'],
            'metrics': result['metrics'],
            'cluster_sizes': result['cluster_sizes'],
            'cluster_profiles': cluster_profiles,
            'feature_names': numeric_cols,
            'dendrogram': dendrogram_data
        }
    
    @staticmethod
    def _get_cluster_profiles(df: pd.DataFrame, numeric_cols: list, labels: list) -> dict:
        df_temp = df.copy()
        df_temp['cluster'] = labels
        
        profiles = {}
        
        for cluster_id in sorted(set(labels)):
            cluster_data = df_temp[df_temp['cluster'] == cluster_id]
            
            profile = {}
            for col in numeric_cols:
                if col in cluster_data.columns:
                    profile[col] = {
                        'mean': float(cluster_data[col].mean()),
                        'std': float(cluster_data[col].std()),
                        'min': float(cluster_data[col].min()),
                        'max': float(cluster_data[col].max())
                    }
            
            profile['size'] = len(cluster_data)
            profile['percentage'] = float(len(cluster_data) / len(df_temp) * 100)
            
            top_characteristics = ClusteringService._get_top_characteristics(profile, numeric_cols)
            profile['top_characteristics'] = top_characteristics
            
            profiles[f'Cluster {cluster_id}'] = profile
        
        return profiles
    
    @staticmethod
    def _get_top_characteristics(profile: dict, numeric_cols: list) -> list:
        characteristics = []
        
        overall_means = {}
        for col in numeric_cols:
            overall_means[col] = profile[col]['mean']
        
        for col in numeric_cols:
            cluster_mean = profile[col]['mean']
            overall_mean = overall_means[col]
            if overall_mean != 0:
                diff_pct = ((cluster_mean - overall_mean) / overall_mean) * 100
                characteristics.append({
                    'feature': col,
                    'cluster_mean': round(cluster_mean, 2),
                    'diff_from_avg': round(diff_pct, 1)
                })
        
        characteristics.sort(key=lambda x: abs(x['diff_from_avg']), reverse=True)
        
        return characteristics[:3]