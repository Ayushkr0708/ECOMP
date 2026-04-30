from flask import Blueprint, request, jsonify
from .services.auth_service import AuthService
from .utils.token import validate_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400
    
    result, error = AuthService.register(username, email, password)
    
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(result), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    result, error = AuthService.login(username, password)
    
    if error:
        return jsonify({'error': error}), 401
    
    return jsonify(result), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        payload = validate_token(token)
        user = AuthService.get_user_by_id(payload['user_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 401

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        payload = validate_token(token)
        return jsonify({'valid': True, 'user_id': payload['user_id']}), 200
    except ValueError as e:
        return jsonify({'valid': False, 'error': str(e)}), 401