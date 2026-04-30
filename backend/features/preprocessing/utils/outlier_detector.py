import pandas as pd
import numpy as np

def detect_outliers_iqr(df: pd.DataFrame, column: str, threshold: float = 1.5) -> pd.Series:
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - threshold * IQR
    upper_bound = Q3 + threshold * IQR
    return (df[column] < lower_bound) | (df[column] > upper_bound)

def detect_outliers_zscore(df: pd.DataFrame, column: str, threshold: float = 3) -> pd.Series:
    mean = df[column].mean()
    std = df[column].std()
    if std == 0:
        return pd.Series([False] * len(df))
    z_scores = np.abs((df[column] - mean) / std)
    return z_scores > threshold

def get_outlier_summary(df: pd.DataFrame, columns: list, method: str = 'iqr') -> dict:
    outlier_counts = {}
    outlier_percentages = {}
    
    for col in columns:
        if df[col].dtype in ['int64', 'float64']:
            if method == 'iqr':
                outliers = detect_outliers_iqr(df, col)
            else:
                outliers = detect_outliers_zscore(df, col)
            
            outlier_counts[col] = int(outliers.sum())
            outlier_percentages[col] = round(outliers.sum() / len(df) * 100, 2)
    
    return {
        'outlier_counts': outlier_counts,
        'outlier_percentages': outlier_percentages,
        'method': method
    }

def handle_outliers(df: pd.DataFrame, columns: list, method: str = 'clip', strategy: str = 'iqr') -> pd.DataFrame:
    df = df.copy()
    
    for col in columns:
        if df[col].dtype not in ['int64', 'float64']:
            continue
            
        if method == 'clip':
            if strategy == 'iqr':
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR
            else:
                mean = df[col].mean()
                std = df[col].std()
                lower = mean - 3 * std
                upper = mean + 3 * std
            
            df[col] = df[col].clip(lower, upper)
        
        elif method == 'remove':
            if strategy == 'iqr':
                outliers = detect_outliers_iqr(df, col)
            else:
                outliers = detect_outliers_zscore(df, col)
            df = df[~outliers]
        
        elif method == 'mean':
            mean = df[col].mean()
            if strategy == 'iqr':
                outliers = detect_outliers_iqr(df, col)
            else:
                outliers = detect_outliers_zscore(df, col)
            df.loc[outliers, col] = mean
    
    return df