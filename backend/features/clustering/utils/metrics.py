import numpy as np
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score

def calculate_silhouette(X: np.ndarray, labels: np.ndarray) -> float:
    if len(np.unique(labels)) < 2:
        return 0.0
    try:
        return silhouette_score(X, labels)
    except:
        return 0.0

def calculate_calinski_harabasz(X: np.ndarray, labels: np.ndarray) -> float:
    if len(np.unique(labels)) < 2:
        return 0.0
    try:
        return calinski_harabasz_score(X, labels)
    except:
        return 0.0

def calculate_davies_bouldin(X: np.ndarray, labels: np.ndarray) -> float:
    if len(np.unique(labels)) < 2:
        return 0.0
    try:
        return davies_bouldin_score(X, labels)
    except:
        return 0.0

def evaluate_clustering(X: np.ndarray, labels: np.ndarray) -> dict:
    metrics = {
        'silhouette_score': float(calculate_silhouette(X, labels)),
        'calinski_harabasz': float(calculate_calinski_harabasz(X, labels)),
        'davies_bouldin': float(calculate_davies_bouldin(X, labels)),
        'n_clusters': int(len(np.unique(labels))),
        'n_noise': int(np.sum(labels == -1)) if -1 in labels else 0
    }
    return metrics