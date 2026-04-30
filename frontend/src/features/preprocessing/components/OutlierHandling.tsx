import React from 'react';

interface OutlierHandlingProps {
  options: {
    enabled: boolean;
    method: 'iqr' | 'zscore';
    handling: 'clip' | 'remove' | 'mean';
  };
  onChange: (options: OutlierHandlingProps['options']) => void;
  outlierAnalysis?: {
    outlier_counts: Record<string, number>;
    outlier_percentages: Record<string, number>;
  };
}

export const OutlierHandling: React.FC<OutlierHandlingProps> = ({ options, onChange, outlierAnalysis }) => {
  return (
    <div className="preprocessing-section">
      <h3>Outlier Handling</h3>
      
      <div className="option-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={options.enabled}
            onChange={(e) => onChange({ ...options, enabled: e.target.checked })}
          />
          Detect and handle outliers
        </label>
      </div>
      
      {options.enabled && (
        <>
          <div className="option-group">
            <label>Detection Method:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="outlier_method"
                  value="iqr"
                  checked={options.method === 'iqr'}
                  onChange={(e) => onChange({ ...options, method: 'iqr' })}
                />
                IQR (Interquartile Range)
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="outlier_method"
                  value="zscore"
                  checked={options.method === 'zscore'}
                  onChange={(e) => onChange({ ...options, method: 'zscore' })}
                />
                Z-Score (3 std deviations)
              </label>
            </div>
          </div>
          
          <div className="option-group">
            <label>Handling Method:</label>
            <select
              value={options.handling}
              onChange={(e) => onChange({ ...options, handling: e.target.value as any })}
              className="select-input"
            >
              <option value="clip">Clip to bounds</option>
              <option value="remove">Remove outliers</option>
              <option value="mean">Replace with mean</option>
            </select>
          </div>
          
          {outlierAnalysis && outlierAnalysis.outlier_counts && (
            <div className="outlier-summary">
              <h4>Outlier Detection Summary</h4>
              <div className="outlier-grid">
                {Object.entries(outlierAnalysis.outlier_counts).map(([col, count]) => (
                  <div key={col} className="outlier-card">
                    <span className="outlier-col">{col}</span>
                    <span className="outlier-count">{count} outliers</span>
                    <span className="outlier-pct">{outlierAnalysis.outlier_percentages[col]}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};