from flask import Blueprint, request, jsonify
from .services.data_service import DataService
import os

data_bp = Blueprint('data', __name__, url_prefix='/api/data')

@data_bp.route('/upload', methods=['POST'])
def upload_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        import pandas as pd
        import os
        from werkzeug.utils import secure_filename
        
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'data', 'raw')
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        
        df = pd.read_csv(filepath)
        
        required_cols = ['customer_id', 'age', 'annual_income', 'spending_score', 'purchase_frequency', 'avg_order_value', 'last_purchase_days']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            return jsonify({'error': f'Missing columns: {missing}'}), 400
        
        preview = df.head(100).to_dict('records')
        full_data = df.to_dict('records')
        
        return jsonify({
            'filename': filename,
            'preview': preview,
            'full_data': full_data,
            'stats': {
                'total_rows': len(df),
                'columns': list(df.columns),
                'numeric_summary': df.describe().to_dict()
            },
            'filepath': filepath
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@data_bp.route('/generate', methods=['POST'])
def generate_synthetic():
    data = request.get_json() or {}
    num_customers = data.get('num_customers', 1000)
    
    result, error = DataService.generate_synthetic(int(num_customers))
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(result), 200

@data_bp.route('/files', methods=['GET'])
def get_files():
    files = DataService.get_saved_files()
    return jsonify({'files': files}), 200

@data_bp.route('/load', methods=['POST'])
def load_data():
    data = request.get_json()
    filepath = data.get('filepath')
    
    if not filepath:
        return jsonify({'error': 'Filepath is required'}), 400
    
    df, error = DataService.load_data(filepath)
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify({
        'total_rows': len(df),
        'columns': list(df.columns),
        'data': df.to_dict('records')
    }), 200