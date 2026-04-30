import os
import pandas as pd
from flask import jsonify
from ..utils.csv_parser import parse_csv, save_uploaded_file
from ..utils.synthetic_generator import generate_synthetic_customers, save_synthetic_data

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'data')
RAW_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
SAMPLES_DIR = os.path.join(DATA_DIR, 'samples')

class DataService:
    @staticmethod
    def upload_csv(file) -> tuple[dict | None, str | None]:
        filepath, error = save_uploaded_file(file, RAW_DIR)
        if error is not None:
            return None, error
        
        df, parse_error = parse_csv(filepath)
        if parse_error is not None:
            return None, parse_error
        
        preview = df.head(100).to_dict('records')
        full_data = df.to_dict('records')
        stats = {
            'total_rows': len(df),
            'columns': list(df.columns),
            'numeric_summary': df.describe().to_dict()
        }
        
        return {
            'filename': os.path.basename(filepath),
            'preview': preview,
            'full_data': full_data,
            'stats': stats,
            'filepath': filepath
        }, None

    @staticmethod
    def generate_synthetic(num_customers: int = 1000) -> tuple[dict | None, str]:
        if num_customers < 100 or num_customers > 50000:
            return None, "Number of customers must be between 100 and 50,000"
        
        df = generate_synthetic_customers(num_customers)
        filepath = save_synthetic_data(df, SAMPLES_DIR, f"synthetic_{num_customers}.csv")
        
        preview = df.head(100).to_dict('records')
        full_data = df.to_dict('records')
        stats = {
            'total_rows': len(df),
            'columns': list(df.columns),
            'numeric_summary': df.describe().to_dict()
        }
        
        return {
            'filename': os.path.basename(filepath),
            'preview': preview,
            'full_data': full_data,
            'stats': stats,
            'filepath': filepath
        }, None

    @staticmethod
    def get_saved_files() -> list:
        files = []
        for directory in [RAW_DIR, SAMPLES_DIR]:
            if os.path.exists(directory):
                for f in os.listdir(directory):
                    if f.endswith('.csv'):
                        files.append({
                            'name': f,
                            'path': os.path.join(directory, f),
                            'type': 'raw' if directory == RAW_DIR else 'sample'
                        })
        return files

    @staticmethod
    def load_data(filepath: str) -> tuple[pd.DataFrame | None, str]:
        if not os.path.exists(filepath):
            return None, "File not found"
        
        try:
            df = pd.read_csv(filepath)
            return df, "Data loaded successfully"
        except Exception as e:
            return None, f"Error loading data: {str(e)}"