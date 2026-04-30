import pandas as pd
import numpy as np

def clean_nan_values(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in df.columns:
        if df[col].dtype.name == 'category':
            df[col] = df[col].astype(str).replace('nan', None).replace('None', None)
        elif df[col].dtype in ['int64', 'float64']:
            df[col] = df[col].replace({np.nan: None})
    return df

def create_rfm_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    if 'last_purchase_days' in df.columns:
        df['recency'] = df['last_purchase_days']
    
    if 'purchase_frequency' in df.columns:
        df['frequency'] = df['purchase_frequency']
    
    if 'avg_order_value' in df.columns:
        df['monetary'] = df['avg_order_value']
    
    if all(col in df.columns for col in ['recency', 'frequency', 'monetary']):
        df['rfm_score'] = (
            (df['recency'].rank(pct=True) * 0.33) +
            (df['frequency'].rank(pct=True) * 0.33) +
            (df['monetary'].rank(pct=True) * 0.34)
        ) * 100
    
    return df

def create_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    if 'annual_income' in df.columns and 'avg_order_value' in df.columns:
        df['income_to_order_ratio'] = df['annual_income'] / (df['avg_order_value'] + 1)
    
    if 'purchase_frequency' in df.columns and 'annual_income' in df.columns:
        df['purchase_intensity'] = df['purchase_frequency'] / (df['annual_income'] / 10000 + 1)
    
    if 'spending_score' in df.columns and 'purchase_frequency' in df.columns:
        df['engagement_index'] = df['spending_score'] * df['purchase_frequency'] / 100
    
    if 'age' in df.columns:
        df['age_group'] = pd.cut(df['age'], bins=[0, 25, 35, 45, 55, 100], 
                                  labels=['18-25', '26-35', '36-45', '46-55', '55+'])
    
    if 'annual_income' in df.columns:
        df['income_group'] = pd.cut(df['annual_income'], bins=[0, 30000, 60000, 100000, float('inf')],
                                    labels=['Low', 'Medium', 'High', 'Premium'])
    
    return df

def add_all_features(df: pd.DataFrame, include_rfm: bool = True, include_derived: bool = True) -> pd.DataFrame:
    if include_rfm:
        df = create_rfm_features(df)
    
    if include_derived:
        df = create_derived_features(df)
    
    return df

def get_feature_info(df: pd.DataFrame) -> dict:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    return {
        'numeric_features': numeric_cols,
        'categorical_features': categorical_cols,
        'total_features': len(numeric_cols) + len(categorical_cols)
    }