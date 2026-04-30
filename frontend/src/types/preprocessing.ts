import { CustomerData } from './data';

export interface PreprocessingOptions {
  clean: boolean;
  clean_options?: {
    handle_missing: boolean;
    missing_strategy: 'mean' | 'median' | 'mode' | 'drop';
    remove_duplicates: boolean;
    remove_invalid: boolean;
  };
  handle_outliers: boolean;
  outlier_method: 'iqr' | 'zscore';
  outlier_handling: 'clip' | 'remove' | 'mean';
  scale: boolean;
  scale_method: 'minmax' | 'standard' | 'robust';
  scale_columns?: string[];
  feature_engineering: boolean;
  include_rfm: boolean;
  include_derived: boolean;
}

export interface OutlierAnalysis {
  outlier_counts: Record<string, number>;
  outlier_percentages: Record<string, number>;
  method: string;
}

export interface PreprocessingResult {
  cleaning?: Record<string, unknown>;
  outlier_detection?: OutlierAnalysis;
  outlier_handling?: Record<string, unknown>;
  scaling?: Record<string, unknown>;
  feature_engineering?: {
    numeric_features: string[];
    categorical_features: string[];
    total_features: number;
  };
  processed_data: CustomerData[];
  output_file: string;
  stats: {
    total_rows: number;
    columns: string[];
    numeric_summary: Record<string, Record<string, number>>;
    after_outlier_handling?: number;
  };
}