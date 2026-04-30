import numpy as np
from sklearn.cluster import DBSCAN
from .metrics import evaluate_clustering

def run_dbscan(X: np.ndarray, eps: float = 0.5, min_samples: int = 5) -> dict:
    dbscan = DBSCAN(eps=eps, min_samples=min_samples)
    labels = dbscan.fit_predict(X)
    
    metrics = evaluate_clustering(X, labels)
    
    unique_labels = np.unique(labels)
    cluster_centers = []
    
    for label in unique_labels:
        if label != -1:
            cluster_points = X[labels == label]
            center = cluster_points.mean(axis=0).tolist()
            cluster_centers.append(center)
    
    cluster_sizes = {}
    for label in unique_labels:
        if label == -1:
            cluster_sizes['Noise'] = int(np.sum(labels == label))
        else:
            cluster_sizes[f'Cluster {label}'] = int(np.sum(labels == label))
    
    return {
        'labels': labels.tolist(),
        'centers': cluster_centers,
        'metrics': metrics,
        'cluster_sizes': cluster_sizes,
        'eps': eps,
        'min_samples': min_samples
    }

def find_optimal_eps(X: np.ndarray, min_samples: int = 5, sample_size: int = 1000) -> list:
    from sklearn.neighbors import NearestNeighbors
    
    if len(X) > sample_size:
        sample = X[:sample_size]
    else:
        sample = X
    
    nn = NearestNeighbors(n_neighbors=min_samples)
    nn.fit(sample)
    distances, _ = nn.kneighbors(sample)
    
    k_distances = np.sort(distances[:, min_samples - 1])
    
    results = []
    for eps in np.arange(0.1, 2.0, 0.1):
        dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        labels = dbscan.fit_predict(sample)
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        n_noise = list(labels).count(-1)
        
        results.append({
            'eps': round(eps, 2),
            'n_clusters': n_clusters,
            'n_noise': n_noise
        })
    
    return results