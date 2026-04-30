import pandas as pd
import numpy as np

def handle_missing_values(df: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
    df = df.copy()
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    if strategy == 'mean':
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
    elif strategy == 'median':
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    elif strategy == 'mode':
        for col in categorical_cols:
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    elif strategy == 'drop':
        df = df.dropna()
    
    return df

def remove_duplicates(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    initial_count = len(df)
    df = df.drop_duplicates()
    removed_count = initial_count - len(df)
    return df, removed_count

def clean_data(df: pd.DataFrame, options: dict) -> dict:
    result = {}
    
    if options.get('handle_missing'):
        strategy = options.get('missing_strategy', 'mean')
        df = handle_missing_values(df, strategy)
        result['missing_handled'] = True
    
    if options.get('remove_duplicates'):
        df, removed = remove_duplicates(df)
        result['duplicates_removed'] = removed
    
    if options.get('remove_invalid'):
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64']:
                df = df[df[col].notna()]
                df = df[df[col] >= 0] if 'income' not in col.lower() else df
    
    return {
        'cleaned_data': df.to_dict('records'),
        'stats': {
            'total_rows': len(df),
            'columns': list(df.columns),
            'missing_values': df.isnull().sum().to_dict(),
            'numeric_summary': df.describe().to_dict()
        },
        'result': result
    }