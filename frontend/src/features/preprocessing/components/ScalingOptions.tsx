import React from 'react';

interface ScalingOptionsProps {
  enabled: boolean;
  method: 'minmax' | 'standard' | 'robust';
  onChange: (enabled: boolean, method: string) => void;
}

export const ScalingOptions: React.FC<ScalingOptionsProps> = ({ enabled, method, onChange }) => {
  return (
    <div className="preprocessing-section">
      <h3>Feature Scaling</h3>
      
      <div className="option-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked, method)}
          />
          Scale numeric features
        </label>
      </div>
      
      {enabled && (
        <div className="option-group">
          <label>Scaling Method:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="scale_method"
                value="minmax"
                checked={method === 'minmax'}
                onChange={() => onChange(true, 'minmax')}
              />
              Min-Max (0 to 1)
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="scale_method"
                value="standard"
                checked={method === 'standard'}
                onChange={() => onChange(true, 'standard')}
              />
              Standard (mean=0, std=1)
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="scale_method"
                value="robust"
                checked={method === 'robust'}
                onChange={() => onChange(true, 'robust')}
              />
              Robust (median, IQR)
            </label>
          </div>
          <p className="option-hint">
            {method === 'minmax' && 'Scales features to [0, 1] range. Good for algorithms sensitive to feature scales.'}
            {method === 'standard' && 'Standardizes features to mean=0, std=1. Good for most ML algorithms.'}
            {method === 'robust' && 'Uses median and IQR. Robust to outliers.'}
          </p>
        </div>
      )}
    </div>
  );
};