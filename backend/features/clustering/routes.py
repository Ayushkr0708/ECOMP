from flask import Blueprint, request, jsonify
from .services.clustering_service import ClusteringService

clustering_bp = Blueprint('clustering', __name__, url_prefix='/api/clustering')

@clustering_bp.route('/kmeans', methods=['POST'])
def kmeans_clustering():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    input_data = data.get('data', [])
    n_clusters = data.get('n_clusters', 3)
    find_optimal = data.get('find_optimal', False)
    
    if not input_data:
        return jsonify({'error': 'No data to cluster'}), 400
    
    result = ClusteringService.cluster_kmeans(input_data, n_clusters, find_optimal)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    return jsonify(result), 200

@clustering_bp.route('/dbscan', methods=['POST'])
def dbscan_clustering():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    input_data = data.get('data', [])
    eps = data.get('eps', 0.5)
    min_samples = data.get('min_samples', 5)
    
    if not input_data:
        return jsonify({'error': 'No data to cluster'}), 400
    
    result = ClusteringService.cluster_dbscan(input_data, eps, min_samples)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    return jsonify(result), 200

@clustering_bp.route('/hierarchical', methods=['POST'])
def hierarchical_clustering():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    input_data = data.get('data', [])
    n_clusters = data.get('n_clusters', 3)
    linkage = data.get('linkage', 'ward')
    
    if not input_data:
        return jsonify({'error': 'No data to cluster'}), 400
    
    result = ClusteringService.cluster_hierarchical(input_data, n_clusters, linkage)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    return jsonify(result), 200