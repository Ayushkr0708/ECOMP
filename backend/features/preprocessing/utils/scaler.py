import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler, RobustScaler

def minmax_scale(df: pd.DataFrame, columns: list) -> tuple[pd.DataFrame, dict]:
    df = df.copy()
    scaler = MinMaxScaler()
    
    df[columns] = scaler.fit_transform(df[columns])
    
    return df, {
        'method': 'minmax',
        'feature_ranges': {col: {'min': float(df[col].min()), 'max': float(df[col].max())} for col in columns}
    }

def standard_scale(df: pd.DataFrame, columns: list) -> tuple[pd.DataFrame, dict]:
    df = df.copy()
    scaler = StandardScaler()
    
    df[columns] = scaler.fit_transform(df[columns])
    
    return df, {
        'method': 'standard',
        'feature_stats': {col: {'mean': float(df[col].mean()), 'std': float(df[col].std())} for col in columns}
    }

def robust_scale(df: pd.DataFrame, columns: list) -> tuple[pd.DataFrame, dict]:
    df = df.copy()
    scaler = RobustScaler()
    
    df[columns] = scaler.fit_transform(df[columns])
    
    return df, {
        'method': 'robust',
        'feature_medians': {col: {'median': float(df[col].median()), 'iqr': float(df[col].quantile(0.75) - df[col].quantile(0.25))} for col in columns}
    }

def scale_features(df: pd.DataFrame, columns: list, method: str = 'standard') -> tuple[pd.DataFrame, dict]:
    if method == 'minmax':
        return minmax_scale(df, columns)
    elif method == 'standard':
        return standard_scale(df, columns)
    elif method == 'robust':
        return robust_scale(df, columns)
    else:
        raise ValueError(f"Unknown scaling method: {method}")