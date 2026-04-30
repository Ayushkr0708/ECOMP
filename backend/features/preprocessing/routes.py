from flask import Blueprint, request, jsonify
from .services.preprocessing_service import PreprocessingService

preprocessing_bp = Blueprint('preprocessing', __name__, url_prefix='/api/preprocessing')

@preprocessing_bp.route('/process', methods=['POST'])
def preprocess_data():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    input_data = data.get('data', [])
    options = data.get('options', {})
    
    if not input_data:
        return jsonify({'error': 'No data to process'}), 400
    
    result = PreprocessingService.preprocess_data(input_data, options)
    return jsonify(result), 200

@preprocessing_bp.route('/analyze-outliers', methods=['POST'])
def analyze_outliers():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    input_data = data.get('data', [])
    columns = data.get('columns', [])
    method = data.get('method', 'iqr')
    
    if not input_data or not columns:
        return jsonify({'error': 'Data and columns required'}), 400
    
    result = PreprocessingService.get_outlier_analysis(input_data, columns, method)
    return jsonify(result), 200