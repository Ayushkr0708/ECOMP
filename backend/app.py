from flask import Flask
from flask_cors import CORS
from config import config
from features.auth.models.user import db
from features.auth import auth_bp
from features.data import data_bp
from features.preprocessing import preprocessing_bp
from features.clustering import clustering_bp
from features.analysis import analysis_bp
import os

def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    db.init_app(app)
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(data_bp)
    app.register_blueprint(preprocessing_bp)
    app.register_blueprint(clustering_bp)
    app.register_blueprint(analysis_bp)
    
    with app.app_context():
        db.create_all()
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy'}, 200
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)