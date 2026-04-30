import React, { useState, useEffect } from 'react';

export const AnalysisPage: React.FC = () => {
  const [dataReady, setDataReady] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [distributions, setDistributions] = useState<any>({});
  const [correlation, setCorrelation] = useState<any>(null);
  const [clusterData, setClusterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const checkData = () => {
      const saved = localStorage.getItem('processedData') || localStorage.getItem('currentData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) setDataReady(true);
        } catch (e) {}
      }
    };
    checkData();
  }, []);

  const runAnalysis = async () => {
    const savedData = localStorage.getItem('processedData') || localStorage.getItem('currentData');
    if (!savedData) return;
    
    setIsLoading(true);
    const data = JSON.parse(savedData);

    try {
      const summaryRes = await fetch('http://localhost:5000/api/analysis/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      const corrRes = await fetch('http://localhost:5000/api/analysis/correlation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      const corrData = await corrRes.json();
      setCorrelation(corrData);

      const numericCols = summaryData.numeric_columns || [];
      const dists: any = {};
      for (const col of numericCols.slice(0, 4)) {
        const distRes = await fetch('http://localhost:5000/api/analysis/distribution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, column: col, bins: 10 })
        });
        if (distRes.ok) {
          dists[col] = await distRes.json();
        }
      }
      setDistributions(dists);

      const clusterResult = localStorage.getItem('clusteringResult');
      if (clusterResult) {
        const parsed = JSON.parse(clusterResult);
        const labels = parsed.labels || [];
        const clusterRes = await fetch('http://localhost:5000/api/analysis/cluster-distribution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, labels })
        });
        if (clusterRes.ok) {
          setClusterData(await clusterRes.json());
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
    }
    setIsLoading(false);
  };

  const getBarWidth = (count: number, max: number) => {
    const percent = max > 0 ? (count / max) * 100 : 0;
    return `${Math.max(percent, 2)}%`;
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Data Analysis</h1>
        <p style={{ color: '#666' }}>Exploratory data analysis and visualizations</p>
      </div>

      {!dataReady && (
        <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '4px', marginBottom: '1rem' }}>
          <strong>No data!</strong> Please upload/generate and preprocess data first.
        </div>
      )}

      {dataReady && (
        <button
          onClick={runAnalysis}
          disabled={isLoading}
          style={{
            padding: '0.75rem 2rem',
            background: '#4a90d9',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          {isLoading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      )}

      {summary && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['summary', 'distributions', 'correlation', 'clusters'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeTab === tab ? '#4a90d9' : 'white',
                  color: activeTab === tab ? 'white' : '#555',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'summary' && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Data Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '600', color: '#333' }}>{summary.total_rows}</div>
                  <div style={{ color: '#666' }}>Total Rows</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '600', color: '#333' }}>{summary.total_columns}</div>
                  <div style={{ color: '#666' }}>Total Columns</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '600', color: '#333' }}>{summary.numeric_columns?.length || 0}</div>
                  <div style={{ color: '#666' }}>Numeric Features</div>
                </div>
              </div>

              <h4 style={{ marginBottom: '0.5rem' }}>Numeric Summary</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Column</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Mean</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Std</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Min</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.numeric_summary || {}).slice(0, 8).map(([col, stats]: [string, any]) => (
                      <tr key={col}>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>{col}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #eee' }}>{stats.mean?.toFixed(2)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #eee' }}>{stats.std?.toFixed(2)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #eee' }}>{stats.min?.toFixed(2)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #eee' }}>{stats.max?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'distributions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {Object.entries(distributions).map(([col, dist]: [string, any]) => {
                const maxCount = Math.max(...(dist.bins || []));
                return (
                  <div key={col} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ color: '#333', marginBottom: '1rem' }}>{col} Distribution</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {(dist.bins || []).map((count: number, idx: number) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#666', width: '60px' }}>
                            {Math.round(dist.edges[idx])}-{Math.round(dist.edges[idx + 1])}
                          </span>
                          <div style={{ flex: 1, background: '#e8f4fd', height: '20px', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: getBarWidth(count, maxCount), 
                              background: '#4a90d9', 
                              height: '100%' 
                            }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#555', width: '40px', textAlign: 'right' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
                      Mean: {dist.mean?.toFixed(2)} | Median: {dist.median?.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'correlation' && correlation && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Correlation Matrix</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}></th>
                      {correlation.columns?.map((col: string) => (
                        <th key={col} style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlation.columns?.map((rowCol: string) => (
                      <tr key={rowCol}>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd', fontWeight: '500' }}>{rowCol}</td>
                        {correlation.columns?.map((colCol: string) => {
                          const val = correlation.matrix[rowCol]?.[colCol] || 0;
                          const intensity = Math.abs(val);
                          return (
                            <td
                              key={colCol}
                              style={{
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                textAlign: 'center',
                                background: val > 0 ? `rgba(74, 144, 217, ${intensity})` : val < 0 ? `rgba(220, 53, 69, ${intensity})` : '#fff',
                                color: intensity > 0.5 ? 'white' : '#333'
                              }}
                            >
                              {val.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'clusters' && clusterData && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Cluster Analysis</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {Object.entries(clusterData.cluster_counts || {}).map(([name, count]: [string, any]) => (
                  <div key={name} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '4px', textAlign: 'center', minWidth: '100px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{count}</div>
                    <div style={{ color: '#666', fontSize: '0.85rem' }}>{name}</div>
                  </div>
                ))}
              </div>

              {Object.entries(clusterData.cluster_stats || {}).map(([cluster, stats]: [string, any]) => (
                <div key={cluster} style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
                  <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>{cluster} - Feature Means</h4>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {Object.entries(stats).slice(0, 6).map(([feat, vals]: [string, any]) => (
                      <div key={feat} style={{ background: '#f8f9fa', padding: '0.5rem', borderRadius: '4px', minWidth: '120px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{feat}</div>
                        <div style={{ fontWeight: '500' }}>{vals.mean?.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};