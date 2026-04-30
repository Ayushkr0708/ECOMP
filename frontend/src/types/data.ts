export interface CustomerData {
  customer_id: string;
  age: number;
  annual_income: number;
  spending_score: number;
  purchase_frequency: number;
  avg_order_value: number;
  last_purchase_days: number;
  preferred_category?: string;
  engagement_level?: string;
}

export interface DataStats {
  total_rows: number;
  columns: string[];
  numeric_summary: Record<string, Record<string, number>>;
}

export interface DataUploadResponse {
  filename: string;
  preview: CustomerData[];
  stats: DataStats;
  filepath: string;
}

export interface SavedFile {
  name: string;
  path: string;
  type: 'raw' | 'sample';
}

export interface LoadDataResponse {
  total_rows: number;
  columns: string[];
  data: CustomerData[];
}