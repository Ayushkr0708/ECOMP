import pandas as pd
import os
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'csv'}

REQUIRED_COLUMNS = [
    'customer_id', 'age', 'annual_income', 'spending_score',
    'purchase_frequency', 'avg_order_value', 'last_purchase_days'
]

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_csv_structure(df: pd.DataFrame) -> tuple[bool, str]:
    missing_cols = set(REQUIRED_COLUMNS) - set(df.columns)
    if missing_cols:
        return False, f"Missing required columns: {', '.join(missing_cols)}"
    
    return True, "Valid"

def parse_csv(file_path: str) -> tuple[pd.DataFrame | None, str]:
    try:
        df = pd.read_csv(file_path)
        is_valid, message = validate_csv_structure(df)
        if not is_valid:
            return None, message
        
        numeric_cols = ['age', 'annual_income', 'spending_score', 'purchase_frequency', 'avg_order_value', 'last_purchase_days']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        return df, "CSV parsed successfully"
    except Exception as e:
        return None, f"Error parsing CSV: {str(e)}"

def save_uploaded_file(file, upload_dir: str) -> tuple[str | None, str | None]:
    if not file or not file.filename:
        return None, "No file provided"
    
    if not allowed_file(file.filename):
        return None, "Only CSV files are allowed"
    
    os.makedirs(upload_dir, exist_ok=True)
    filename = secure_filename(file.filename)
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)
    
    return filepath, None