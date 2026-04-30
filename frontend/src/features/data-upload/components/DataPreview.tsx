import React from 'react';
import { CustomerData, DataStats } from '../../types/data';

interface DataPreviewProps {
  preview: CustomerData[];
  stats: DataStats;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ preview, stats }) => {
  if (!preview || preview.length === 0) {
    return <div className="data-preview"><p>No preview data available</p></div>;
  }

  try {
    const columns = Object.keys(preview[0]);

    return (
      <div className="data-preview">
        <div className="preview-header">
          <h3>Data Preview</h3>
          <span className="row-count">{stats?.total_rows || preview.length} total rows</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td key={col}>{row[col as keyof CustomerData]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stats?.numeric_summary && (
          <div className="stats-section">
            <h4>Statistics Summary</h4>
            <div className="stats-grid">
              {Object.entries(stats.numeric_summary).slice(0, 6).map(([key, values]: [string, any]) => (
                <div key={key} className="stat-card">
                  <h5>{key}</h5>
                  <div className="stat-values">
                    <span>Mean: {values?.mean?.toFixed(2)}</span>
                    <span>Std: {values?.std?.toFixed(2)}</span>
                    <span>Min: {values?.min}</span>
                    <span>Max: {values?.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (e) {
    console.error('DataPreview error:', e);
    return <div className="data-preview"><p>Error displaying preview</p></div>;
  }
};