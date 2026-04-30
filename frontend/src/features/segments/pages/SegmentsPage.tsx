import React, { useState, useEffect } from 'react';

export const SegmentsPage: React.FC = () => {
  const [clusterResult, setClusterResult] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  useEffect(() => {
    const savedResult = localStorage.getItem('clusteringResult');
    const savedData = localStorage.getItem('processedData') || localStorage.getItem('currentData');
    
    if (savedResult) {
      setClusterResult(JSON.parse(savedResult));
    }
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  const getSegmentColor = (index: number) => {
    const colors = ['#4a90d9', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#e83e8c', '#20c997'];
    return colors[index % colors.length];
  };

  const getSegmentIcon = (index: number) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return letters[index % letters.length];
  };

  const getSegmentName = (index: number, size: number, total: number) => {
    const percentage = ((size / total) * 100).toFixed(1);
    if (percentage > 40) return 'Large Segment';
    if (percentage > 20) return 'Medium Segment';
    if (percentage > 10) return 'Small Segment';
    return 'Niche Segment';
  };

  if (!clusterResult) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>Customer Segments</h1>
        <div style={{ padding: '2rem', background: '#fff3cd', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No clustering results found.</p>
          <p style={{ color: '#666' }}>Please run clustering first to see segment visualizations.</p>
        </div>
      </div>
    );
  }

  const clusterSizes = clusterResult.cluster_sizes || {};
  const totalCustomers = Object.values(clusterSizes).reduce((a: any, b: any) => a + b, 0);
  const clusterProfiles = clusterResult.cluster_profiles || {};
  const featureNames = clusterResult.feature_names || [];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Customer Segments</h1>
        <p style={{ color: '#666' }}>Visual representation of your customer segments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {Object.keys(clusterProfiles).map((clusterName, index) => {
          const profile = clusterProfiles[clusterName];
          const size = profile.size || clusterSizes[clusterName] || 0;
          const percentage = ((size / totalCustomers) * 100).toFixed(1);
          const color = getSegmentColor(index);
          const icon = getSegmentIcon(index);
          const isSelected = selectedSegment === clusterName;

          return (
            <div
              key={clusterName}
              onClick={() => setSelectedSegment(isSelected ? null : clusterName)}
              style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: isSelected ? `2px solid ${color}` : '2px solid transparent'
              }}
            >
              <div style={{ background: color, padding: '1.5rem', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                  }}>
                    {icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{clusterName}</h3>
                    <span style={{ opacity: 0.9 }}>{getSegmentName(index, size, totalCustomers)}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>{size}</div>
                    <div style={{ color: '#666', fontSize: '0.85rem' }}>Customers</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color }}>{percentage}%</div>
                    <div style={{ color: '#666', fontSize: '0.85rem' }}>of Total</div>
                  </div>
                </div>

                {profile.top_characteristics && (
                  <div>
                    <h4 style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Top Characteristics</h4>
                    {profile.top_characteristics.slice(0, 3).map((char: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem',
                          background: idx % 2 === 0 ? '#f8f9fa' : 'white',
                          borderRadius: '4px',
                          marginBottom: '0.25rem'
                        }}
                      >
                        <span style={{ color: '#555', fontSize: '0.9rem' }}>{char.feature}</span>
                        <span
                          style={{
                            fontWeight: '600',
                            color: char.diff_from_avg > 0 ? '#28a745' : '#dc3545',
                            fontSize: '0.9rem'
                          }}
                        >
                          {char.diff_from_avg > 0 ? '+' : ''}{char.diff_from_avg}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {isSelected && featureNames.slice(0, 5).map((feat: string) => (
                  <div key={feat} style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#666' }}>{feat}</span>
                      <span style={{ fontWeight: '500', color: '#333' }}>
                        {profile[feat]?.mean?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
        <h3 style={{ color: '#333', marginBottom: '1rem' }}>Segment Overview</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '180px', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}>
          {Object.keys(clusterProfiles).map((clusterName, index) => {
            const size = clusterProfiles[clusterName].size || clusterSizes[clusterName] || 0;
            const maxSize = Math.max(...Object.values(clusterSizes));
            const height = maxSize > 0 ? (size / maxSize) * 120 : 0;
            const color = getSegmentColor(index);
            const percentage = ((size / totalCustomers) * 100).toFixed(0);

            return (
              <div key={clusterName} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#333', marginBottom: '0.25rem' }}>{percentage}%</span>
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(height, 10)}px`,
                    background: color,
                    borderRadius: '4px 4px 0 0',
                    minHeight: '10px'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.25rem', textAlign: 'center' }}>{clusterName.replace('Cluster ', '')}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};