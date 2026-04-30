import React, { useState, useEffect } from 'react';

interface PreprocessingOptions {
  clean: boolean;
  clean_options?: {
    handle_missing: boolean;
    missing_strategy: string;
    remove_duplicates: boolean;
  };
  handle_outliers: boolean;
  outlier_method: string;
  outlier_handling: string;
  scale: boolean;
  scale_method: string;
  feature_engineering: boolean;
  include_rfm: boolean;
  include_derived: boolean;
}

const defaultOptions: PreprocessingOptions = {
  clean: true,
  clean_options: {
    handle_missing: true,
    missing_strategy: 'mean',
    remove_duplicates: true,
  },
  handle_outliers: true,
  outlier_method: 'iqr',
  outlier_handling: 'clip',
  scale: true,
  scale_method: 'standard',
  feature_engineering: true,
  include_rfm: true,
  include_derived: true,
};

export const PreprocessingPage: React.FC = () => {
  const [options, setOptions] = useState<PreprocessingOptions>(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [outliers, setOutliers] = useState<any>(null);
  const [dataReady, setDataReady] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('currentData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setDataReady(true);
        }
      } catch (e) {
        console.error('Error parsing saved data:', e);
      }
    }
  }, []);

  const handleAnalyzeOutliers = async () => {
    const savedData = localStorage.getItem('currentData');
    if (!savedData) {
      setError('No data available. Please upload or generate data first.');
      return;
    }
    
    const data = JSON.parse(savedData);
    const numericCols = ['age', 'annual_income', 'spending_score', 'purchase_frequency', 'avg_order_value', 'last_purchase_days'];
    
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/preprocessing/analyze-outliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data, columns: numericCols, method: options.outlier_method })
      });
      
      if (!response.ok) throw new Error('Failed to analyze');
      const analysis = await response.json();
      setOutliers(analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze outliers');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreprocess = async () => {
    const savedData = localStorage.getItem('currentData');
    if (!savedData) {
      setError('No data available. Please upload or generate data first.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const data = JSON.parse(savedData);
      const response = await fetch('http://localhost:5000/api/preprocessing/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data, options })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to preprocess');
      }
      
      const res = await response.json();
      setResult(res);
      localStorage.setItem('processedData', JSON.stringify(res.processed_data));
    } catch (err: any) {
      setError(err.message || 'Failed to preprocess data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Data Preprocessing</h1>
        <p style={{ color: '#666' }}>Clean, transform, and prepare your data for clustering</p>
      </div>
      
      {!dataReady && (
        <div style={{ padding: '1rem', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', marginBottom: '1rem' }}>
          <strong>No data available!</strong> Please go to Data Upload page and generate or upload data first.
        </div>
      )}
      
      {dataReady && (
        <div style={{ padding: '0.75rem', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '1rem', color: '#155724' }}>
          [OK] Data loaded and ready for preprocessing
        </div>
      )}
      
      {error && (
        <div style={{ padding: '0.75rem', background: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Data Cleaning</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#555' }}>
            <input type="checkbox" checked={options.clean} onChange={(e) => setOptions({...options, clean: e.target.checked})} />
            Handle missing values
          </label>
          {options.clean && (
            <select
              value={options.clean_options?.missing_strategy}
              onChange={(e) => setOptions({...options, clean_options: {...options.clean_options!, missing_strategy: e.target.value}})}
              style={{ marginTop: '0.5rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="mean">Mean</option>
              <option value="median">Median</option>
              <option value="drop">Drop rows</option>
            </select>
          )}
        </div>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Outlier Handling</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#555' }}>
            <input type="checkbox" checked={options.handle_outliers} onChange={(e) => setOptions({...options, handle_outliers: e.target.checked})} />
            Detect and handle outliers
          </label>
          {options.handle_outliers && (
            <div style={{ marginTop: '1rem' }}>
              <select
                value={options.outlier_method}
                onChange={(e) => setOptions({...options, outlier_method: e.target.value})}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', marginRight: '1rem' }}
              >
                <option value="iqr">IQR Method</option>
                <option value="zscore">Z-Score Method</option>
              </select>
              <select
                value={options.outlier_handling}
                onChange={(e) => setOptions({...options, outlier_handling: e.target.value})}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="clip">Clip to bounds</option>
                <option value="remove">Remove outliers</option>
                <option value="mean">Replace with mean</option>
              </select>
            </div>
          )}
          {outliers && outliers.outlier_counts && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '4px' }}>
              <strong>Outliers found:</strong>
              {Object.entries(outliers.outlier_counts).map(([col, count]: [string, any]) => (
                <div key={col} style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <span>{col}:</span>
                  <span>{count} ({outliers.outlier_percentages[col]}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Feature Scaling</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#555' }}>
            <input type="checkbox" checked={options.scale} onChange={(e) => setOptions({...options, scale: e.target.checked})} />
            Scale numeric features
          </label>
          {options.scale && (
            <select
              value={options.scale_method}
              onChange={(e) => setOptions({...options, scale_method: e.target.value})}
              style={{ marginTop: '0.5rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="minmax">Min-Max (0 to 1)</option>
              <option value="standard">Standard (mean=0)</option>
              <option value="robust">Robust (median)</option>
            </select>
          )}
        </div>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Feature Engineering</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#555' }}>
            <input type="checkbox" checked={options.feature_engineering} onChange={(e) => setOptions({...options, feature_engineering: e.target.checked})} />
            Create derived features
          </label>
          {options.feature_engineering && (
            <div style={{ marginTop: '0.75rem', paddingLeft: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', cursor: 'pointer' }}>
                <input type="checkbox" checked={options.include_rfm} onChange={(e) => setOptions({...options, include_rfm: e.target.checked})} />
                RFM Features
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', cursor: 'pointer', marginTop: '0.5rem' }}>
                <input type="checkbox" checked={options.include_derived} onChange={(e) => setOptions({...options, include_derived: e.target.checked})} />
                Derived Features
              </label>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          onClick={handleAnalyzeOutliers}
          style={{ padding: '0.75rem 2rem', background: 'white', color: '#4a90d9', border: '1px solid #4a90d9', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
          disabled={isLoading}
        >
          Analyze Outliers
        </button>
        <button 
          onClick={handlePreprocess}
          style={{ padding: '0.75rem 2rem', background: '#4a90d9', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Preprocess Data'}
        </button>
      </div>
      
      {result && (
        <div style={{ marginTop: '2rem', background: '#d4edda', padding: '1.5rem', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
          <h3 style={{ color: '#155724', marginBottom: '1rem' }}>Preprocessing Complete!</h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Original Rows</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333' }}>{result.stats?.total_rows}</div>
            </div>
            {result.stats?.after_outlier_handling && (
              <div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>After Outliers</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333' }}>{result.stats.after_outlier_handling}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Features</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333' }}>{result.stats?.columns?.length || 0}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};