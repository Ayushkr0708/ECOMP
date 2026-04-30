import React, { useState, useEffect } from 'react';
import { clusteringApi } from '../api/clusteringApi';
import { ClusteringResult } from '../../types/clustering';

export const ClusteringPage: React.FC = () => {
  const [dataReady, setDataReady] = useState(false);
  const [algorithm, setAlgorithm] = useState('kmeans');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ClusteringResult | null>(null);
  
  const [kClusters, setKClusters] = useState(3);
  const [eps, setEps] = useState(0.5);
  const [minSamples, setMinSamples] = useState(5);
  const [hClusters, setHClusters] = useState(3);
  const [linkage, setLinkage] = useState('ward');
  
  useEffect(() => {
    const saved = localStorage.getItem('processedData') || localStorage.getItem('currentData');
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

  const runClustering = async () => {
    const savedData = localStorage.getItem('processedData') || localStorage.getItem('currentData');
    if (!savedData) {
      setError('No processed data available. Please preprocess data first.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    setResult(null);
    
    try {
      const data = JSON.parse(savedData);
      
      let response: ClusteringResult;
      
      if (algorithm === 'kmeans') {
        response = await clusteringApi.runKMeans(data, { n_clusters: kClusters, find_optimal: false });
      } else if (algorithm === 'dbscan') {
        response = await clusteringApi.runDBSCAN(data, { eps, min_samples: minSamples });
      } else {
        response = await clusteringApi.runHierarchical(data, { n_clusters: hClusters, linkage: linkage as any });
      }
      
      setResult(response);
      localStorage.setItem('clusteringResult', JSON.stringify(response));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to run clustering');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#28a745';
    if (score >= 0.5) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Customer Clustering</h1>
        <p style={{ color: '#666' }}>Apply clustering algorithms to segment your customers</p>
      </div>
      
      {!dataReady && (
        <div style={{ padding: '1rem', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', marginBottom: '1rem' }}>
          <strong>No preprocessed data!</strong> Please go to Preprocessing page and run preprocessing first.
        </div>
      )}
      
      {dataReady && (
        <div style={{ padding: '0.75rem', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', marginBottom: '1rem', color: '#155724' }}>
          [OK] Preprocessed data loaded and ready
        </div>
      )}
      
      {error && (
        <div style={{ padding: '0.75rem', background: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#333', marginBottom: '1rem' }}>Algorithm Selection</h3>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {['kmeans', 'dbscan', 'hierarchical'].map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              style={{
                padding: '0.75rem 1.5rem',
                background: algorithm === algo ? '#4a90d9' : 'white',
                color: algorithm === algo ? 'white' : '#555',
                border: `1px solid ${algorithm === algo ? '#4a90d9' : '#ddd'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {algo === 'kmeans' ? 'K-Means' : algo === 'dbscan' ? 'DBSCAN' : 'Hierarchical'}
            </button>
          ))}
        </div>
        
        {algorithm === 'kmeans' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ color: '#555' }}>Number of Clusters (K):</label>
            <input
              type="number"
              value={kClusters}
              onChange={(e) => setKClusters(Math.max(2, parseInt(e.target.value) || 2))}
              min={2}
              max={20}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', width: '80px' }}
            />
            <span style={{ color: '#666', fontSize: '0.9rem' }}>(2-20 clusters)</span>
          </div>
        )}
        
        {algorithm === 'dbscan' && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ color: '#555', display: 'block', marginBottom: '0.5rem' }}>Epsilon (eps):</label>
              <input
                type="number"
                value={eps}
                onChange={(e) => setEps(parseFloat(e.target.value) || 0.5)}
                step={0.1}
                min={0.1}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', width: '80px' }}
              />
            </div>
            <div>
              <label style={{ color: '#555', display: 'block', marginBottom: '0.5rem' }}>Min Samples:</label>
              <input
                type="number"
                value={minSamples}
                onChange={(e) => setMinSamples(Math.max(1, parseInt(e.target.value) || 5))}
                min={1}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', width: '80px' }}
              />
            </div>
          </div>
        )}
        
        {algorithm === 'hierarchical' && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ color: '#555', display: 'block', marginBottom: '0.5rem' }}>Number of Clusters:</label>
              <input
                type="number"
                value={hClusters}
                onChange={(e) => setHClusters(Math.max(2, parseInt(e.target.value) || 2))}
                min={2}
                max={10}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', width: '80px' }}
              />
            </div>
            <div>
              <label style={{ color: '#555', display: 'block', marginBottom: '0.5rem' }}>Linkage Method:</label>
              <select
                value={linkage}
                onChange={(e) => setLinkage(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="ward">Ward (min variance)</option>
                <option value="complete">Complete</option>
                <option value="average">Average</option>
                <option value="single">Single</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={runClustering}
        disabled={isLoading || !dataReady}
        style={{
          padding: '0.75rem 2rem',
          background: dataReady ? '#4a90d9' : '#a0c4e8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: dataReady ? 'pointer' : 'not-allowed',
          fontSize: '1rem',
          fontWeight: '500',
          display: 'block',
          margin: '0 auto 2rem'
        }}
      >
        {isLoading ? 'Running Clustering...' : 'Run Clustering'}
      </button>
      
      {result && (
        <div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#333', marginBottom: '1rem' }}>Clustering Metrics</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: getScoreColor(result.metrics.silhouette_score) }}>
                  {(result.metrics.silhouette_score * 100).toFixed(0)}%
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Silhouette Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>
                  {result.metrics.n_clusters}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Clusters</div>
              </div>
              {result.metrics.n_noise > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc3545' }}>
                    {result.metrics.n_noise}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>Noise Points</div>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#333', marginBottom: '1rem' }}>Cluster Sizes</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {Object.entries(result.cluster_sizes).map(([name, size]) => (
                <div key={name} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>{size}</div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>{name}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 style={{ color: '#333', marginBottom: '1rem' }}>Cluster Profiles & Top Characteristics</h3>
            {Object.entries(result.cluster_profiles).map(([clusterName, profile]: [string, any]) => (
              <div key={clusterName} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ color: '#333', margin: 0 }}>{clusterName}</h4>
                  <span style={{ background: '#e8f4fd', color: '#4a90d9', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                    {profile.size} customers ({profile.percentage?.toFixed(1)}%)
                  </span>
                </div>
                
                {profile.top_characteristics && profile.top_characteristics.length > 0 && (
                  <div>
                    <div style={{ fontWeight: '500', color: '#555', marginBottom: '0.5rem' }}>Top 3 Characteristics:</div>
                    {profile.top_characteristics.map((char: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: idx % 2 === 0 ? '#f8f9fa' : 'white', borderRadius: '4px' }}>
                        <span style={{ color: '#555' }}>{char.feature}</span>
                        <span style={{ fontWeight: '500', color: char.diff_from_avg > 0 ? '#28a745' : '#dc3545' }}>
                          {char.diff_from_avg > 0 ? '+' : ''}{char.diff_from_avg}% vs avg
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};