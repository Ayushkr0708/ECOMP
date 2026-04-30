import React from 'react';

interface CleaningOptionsProps {
  options: {
    handle_missing: boolean;
    missing_strategy: 'mean' | 'median' | 'mode' | 'drop';
    remove_duplicates: boolean;
    remove_invalid: boolean;
  };
  onChange: (options: CleaningOptionsProps['options']) => void;
}

export const CleaningOptions: React.FC<CleaningOptionsProps> = ({ options, onChange }) => {
  return (
    <div className="preprocessing-section">
      <h3>Data Cleaning</h3>
      
      <div className="option-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={options.handle_missing}
            onChange={(e) => onChange({ ...options, handle_missing: e.target.checked })}
          />
          Handle missing values
        </label>
        
        {options.handle_missing && (
          <select
            value={options.missing_strategy}
            onChange={(e) => onChange({ ...options, missing_strategy: e.target.value as any })}
            className="select-input"
          >
            <option value="mean">Mean (numeric)</option>
            <option value="median">Median (numeric)</option>
            <option value="mode">Mode (most common)</option>
            <option value="drop">Drop rows with missing</option>
          </select>
        )}
      </div>
      
      <div className="option-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={options.remove_duplicates}
            onChange={(e) => onChange({ ...options, remove_duplicates: e.target.checked })}
          />
          Remove duplicate rows
        </label>
      </div>
      
      <div className="option-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={options.remove_invalid}
            onChange={(e) => onChange({ ...options, remove_invalid: e.target.checked })}
          />
          Remove invalid entries (negative values)
        </label>
      </div>
    </div>
  );
};