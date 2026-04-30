import pandas as pd
import numpy as np

class AnalysisService:
    @staticmethod
    def get_distribution(data: list, column: str, bins: int = 20) -> dict:
        df = pd.DataFrame(data)
        
        if column not in df.columns:
            return {'error': f'Column {column} not found'}
        
        if df[column].dtype not in ['int64', 'float64']:
            return {'error': f'Column {column} is not numeric'}
        
        hist, edges = np.histogram(df[column].dropna(), bins=bins)
        
        return {
            'column': column,
            'bins': hist.tolist(),
            'edges': edges.tolist(),
            'min': float(df[column].min()),
            'max': float(df[column].max()),
            'mean': float(df[column].mean()),
            'median': float(df[column].median()),
            'std': float(df[column].std())
        }
    
    @staticmethod
    def get_correlation_matrix(data: list) -> dict:
        df = pd.DataFrame(data)
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_cols) < 2:
            return {'error': 'Not enough numeric columns'}
        
        corr_matrix = df[numeric_cols].corr()
        
        return {
            'columns': numeric_cols,
            'matrix': corr_matrix.to_dict()
        }
    
    @staticmethod
    def get_summary_stats(data: list) -> dict:
        df = pd.DataFrame(data)
        
        numeric_summary = df.describe().to_dict()
        
        categorical_summary = {}
        for col in df.select_dtypes(include=['object']).columns:
            categorical_summary[col] = {
                'unique': int(df[col].nunique()),
                'top': df[col].mode().tolist() if not df[col].mode().empty else [],
                'value_counts': df[col].value_counts().head(5).to_dict()
            }
        
        return {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'numeric_columns': list(df.select_dtypes(include=[np.number]).columns),
            'categorical_columns': list(df.select_dtypes(include=['object']).columns),
            'numeric_summary': numeric_summary,
            'categorical_summary': categorical_summary,
            'missing_values': df.isnull().sum().to_dict()
        }
    
    @staticmethod
    def get_cluster_distribution(data: list, labels: list) -> dict:
        df = pd.DataFrame(data)
        df['cluster'] = labels
        
        if 'cluster' not in df.columns:
            return {'error': 'No cluster labels provided'}
        
        cluster_counts = df['cluster'].value_counts().to_dict()
        
        cluster_stats = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        for cluster in df['cluster'].unique():
            cluster_data = df[df['cluster'] == cluster]
            stats = {}
            for col in numeric_cols:
                stats[col] = {
                    'mean': float(cluster_data[col].mean()),
                    'std': float(cluster_data[col].std()),
                    'min': float(cluster_data[col].min()),
                    'max': float(cluster_data[col].max())
                }
            cluster_stats[f'Cluster {cluster}'] = stats
        
        return {
            'cluster_counts': cluster_counts,
            'cluster_stats': cluster_stats
        }