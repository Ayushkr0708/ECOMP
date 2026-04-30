import numpy as np
from sklearn.cluster import KMeans
from .metrics import evaluate_clustering

def run_kmeans(X: np.ndarray, n_clusters: int = 3, random_state: int = 42) -> dict:
    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=random_state,
        n_init=10,
        max_iter=300
    )
    
    labels = kmeans.fit_predict(X)
    
    metrics = evaluate_clustering(X, labels)
    
    cluster_centers = kmeans.cluster_centers_.tolist()
    
    cluster_sizes = {}
    for i in range(n_clusters):
        cluster_sizes[f'Cluster {i}'] = int(np.sum(labels == i))
    
    return {
        'labels': labels.tolist(),
        'centers': cluster_centers,
        'metrics': metrics,
        'cluster_sizes': cluster_sizes,
        'inertia': float(kmeans.inertia_)
    }

def find_optimal_k(X: np.ndarray, max_k: int = 10) -> list:
    results = []
    for k in range(2, max_k + 1):
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)
        metrics = evaluate_clustering(X, labels)
        results.append({
            'k': k,
            'silhouette': metrics['silhouette_score'],
            'inertia': float(kmeans.inertia_)
        })
    return results