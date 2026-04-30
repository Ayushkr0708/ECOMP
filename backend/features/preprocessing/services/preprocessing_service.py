import pandas as pd
import numpy as np
import os
from ..utils.data_cleaner import clean_data
from ..utils.outlier_detector import get_outlier_summary, handle_outliers
from ..utils.scaler import scale_features
from ..utils.feature_engineer import add_all_features, get_feature_info, clean_nan_values

PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'data', 'processed')

def convert_to_json_safe(df: pd.DataFrame) -> list:
    records = df.head(100).to_dict('records')
    for record in records:
        for key, value in record.items():
            if pd.isna(value) or (isinstance(value, float) and (value != value)):  # NaN check
                record[key] = None
            elif isinstance(value, float) and (value == float('inf') or value == float('-inf')):
                record[key] = None
    return records

class PreprocessingService:
    @staticmethod
    def preprocess_data(data: list, options: dict) -> dict:
        df = pd.DataFrame(data)
        results = {}
        
        if options.get('clean'):
            clean_result = clean_data(df, options.get('clean_options', {}))
            df = pd.DataFrame(clean_result['cleaned_data'])
            results['cleaning'] = clean_result['result']
            results['stats'] = clean_result['stats']
        
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
        
        if options.get('handle_outliers') and numeric_cols:
            outlier_method = options.get('outlier_method', 'iqr')
            outlier_summary = get_outlier_summary(df, numeric_cols, outlier_method)
            results['outlier_detection'] = outlier_summary
            
            handle_method = options.get('outlier_handling', 'clip')
            df = handle_outliers(df, numeric_cols, handle_method, outlier_method)
            results['outlier_handling'] = {'method': handle_method}
            results['stats']['after_outlier_handling'] = len(df)
        
        if options.get('scale') and numeric_cols:
            scale_method = options.get('scale_method', 'standard')
            scale_cols = options.get('scale_columns', numeric_cols)
            df, scale_info = scale_features(df, scale_cols, scale_method)
            results['scaling'] = scale_info
        
        if options.get('feature_engineering'):
            df = add_all_features(
                df,
                include_rfm=options.get('include_rfm', True),
                include_derived=options.get('include_derived', True)
            )
            df = clean_nan_values(df)
            results['feature_engineering'] = get_feature_info(df)
        
        filepath = os.path.join(PROCESSED_DIR, 'preprocessed_data.csv')
        os.makedirs(PROCESSED_DIR, exist_ok=True)
        df.to_csv(filepath, index=False)
        
        results['processed_data'] = convert_to_json_safe(df)
        results['output_file'] = filepath
        
        if 'stats' not in results:
            results['stats'] = {
                'total_rows': len(df),
                'columns': list(df.columns),
                'numeric_summary': df.describe().to_dict()
            }
        
        return results
    
    @staticmethod
    def get_outlier_analysis(data: list, columns: list, method: str = 'iqr') -> dict:
        df = pd.DataFrame(data)
        return get_outlier_summary(df, columns, method)