from flask import Blueprint, request, jsonify
from .services.analysis_service import AnalysisService

analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')

@analysis_bp.route('/distribution', methods=['POST'])
def get_distribution():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    input_data = data.get('data', [])
    column = data.get('column')
    bins = data.get('bins', 20)
    
    if not input_data:
        return jsonify({'error': 'No data provided'}), 400
    
    if not column:
        return jsonify({'error': 'Column name required'}), 400
    
    result = AnalysisService.get_distribution(input_data, column, bins)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    return jsonify(result), 200

@analysis_bp.route('/correlation', methods=['POST'])
def get_correlation():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    input_data = data.get('data', [])
    
    if not input_data:
        return jsonify({'error': 'No data provided'}), 400
    
    result = AnalysisService.get_correlation_matrix(input_data)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    return jsonify(result), 200

@analysis_bp.route('/summary', methods=['POST'])
def get_summary():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    input_data = data.get('data', [])
    
    if not input_data:
        return jsonify({'error': 'No data provided'}), 400
    
    result = AnalysisService.get_summary_stats(input_data)
    return jsonify(result), 200

@analysis_bp.route('/cluster-distribution', methods=['POST'])
def get_cluster_distribution():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    input_data = data.get('data', [])
    labels = data.get('labels', [])
    
    if not input_data or not labels:
        return jsonify({'error': 'Data and labels required'}), 400
    
    result = AnalysisService.get_cluster_distribution(input_data, labels)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    
    return jsonify(result), 200