import numpy as np
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage
from .metrics import evaluate_clustering

def run_hierarchical(X: np.ndarray, n_clusters: int = 3, linkage: str = 'ward') -> dict:
    hierarchical = AgglomerativeClustering(
        n_clusters=n_clusters,
        linkage=linkage
    )
    
    labels = hierarchical.fit_predict(X)
    
    metrics = evaluate_clustering(X, labels)
    
    unique_labels = np.unique(labels)
    cluster_centers = []
    
    for label in unique_labels:
        cluster_points = X[labels == label]
        center = cluster_points.mean(axis=0).tolist()
        cluster_centers.append(center)
    
    cluster_sizes = {}
    for i, label in enumerate(unique_labels):
        cluster_sizes[f'Cluster {label}'] = int(np.sum(labels == label))
    
    return {
        'labels': labels.tolist(),
        'centers': cluster_centers,
        'metrics': metrics,
        'cluster_sizes': cluster_sizes,
        'linkage': linkage
    }

def get_dendrogram_data(X: np.ndarray, method: str = 'ward', max_samples: int = 1000) -> dict:
    if len(X) > max_samples:
        sample = X[:max_samples]
    else:
        sample = X
    
    Z = linkage(sample, method=method)
    
    return {
        'linkage': Z.tolist(),
        'n_samples': len(sample)
    }