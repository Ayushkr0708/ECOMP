import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const IconBox = ({ letter, color }: { letter: string; color: string }) => (
  <div style={{
    width: '48px',
    height: '48px',
    background: color,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  }}>
    {letter}
  </div>
);

const StatBox = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div style={{ 
    background: 'white', 
    padding: '1.5rem', 
    borderRadius: '12px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
    textAlign: 'center',
    borderTop: `4px solid ${color || '#4a90d9'}`
  }}>
    <div style={{ 
      fontSize: '2.5rem', 
      fontWeight: '700', 
      color: color || '#333',
      marginBottom: '0.25rem'
    }}>
      {value}
    </div>
    <div style={{ color: '#666', fontSize: '0.9rem' }}>{label}</div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    segments: 0,
    silhouetteScore: 0,
    hasData: false,
    hasClustering: false
  });

  useEffect(() => {
    const loadStats = () => {
      const processedData = localStorage.getItem('processedData') || localStorage.getItem('currentData');
      const clusterResult = localStorage.getItem('clusteringResult');

      const newStats = {
        totalCustomers: 0,
        segments: 0,
        silhouetteScore: 0,
        hasData: !!processedData,
        hasClustering: !!clusterResult
      };

      if (processedData) {
        try {
          const data = JSON.parse(processedData);
          newStats.totalCustomers = data.length || 0;
        } catch (e) {}
      }

      if (clusterResult) {
        try {
          const result = JSON.parse(clusterResult);
          newStats.segments = result.metrics?.n_clusters || 0;
          newStats.silhouetteScore = result.metrics?.silhouette_score || 0;
        } catch (e) {}
      }

      setStats(newStats);
    };

    loadStats();
    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const getProgressColor = (score: number) => {
    if (score >= 0.8) return '#28a745';
    if (score >= 0.5) return '#ffc107';
    return '#dc3545';
  };

  const features = [
    { title: 'Data Upload', description: 'Upload CSV or generate synthetic customer data', path: '/upload', color: '#4a90d9', initial: 'D' },
    { title: 'Preprocessing', description: 'Clean, scale, and prepare data for clustering', path: '/preprocess', color: '#17a2b8', initial: 'P' },
    { title: 'Clustering', description: 'Apply K-Means, DBSCAN, or Hierarchical clustering', path: '/clustering', color: '#6f42c1', initial: 'C' },
    { title: 'Segments', description: 'Visualize and explore customer segments', path: '/segments', color: '#28a745', initial: 'S' },
    { title: 'Reports', description: 'Get personalized marketing recommendations', path: '/reports', color: '#ffc107', initial: 'R' },
    { title: 'Analysis', description: 'EDA visualizations and data insights', path: '/analysis', color: '#e83e8c', initial: 'A' }
  ].map(f => ({ ...f, status: f.path === '/clustering' || f.path === '/segments' || f.path === '/reports' ? (stats.hasClustering ? 'complete' : 'pending') : (stats.hasData ? 'complete' : 'pending') }));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.75rem' }}>ECOMP Dashboard</h1>
        <p style={{ color: '#666' }}>Customer Segmentation for E-commerce Personalization</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatBox label="Total Customers" value={stats.totalCustomers.toLocaleString()} color="#333" />
        <StatBox label="Customer Segments" value={stats.segments.toString()} color="#333" />
        <StatBox 
          label="Silhouette Score" 
          value={stats.silhouetteScore > 0 ? `${(stats.silhouetteScore * 100).toFixed(0)}%` : '--'} 
          color={getProgressColor(stats.silhouetteScore)} 
        />
        <StatBox 
          label="Target Improvement" 
          value={stats.hasClustering ? '15%' : '--'} 
          color={stats.hasClustering ? '#28a745' : '#999'} 
        />
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.1rem' }}>Project Goals Progress</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#555' }}>Clustering Silhouette Score 80% or higher</span>
            <span style={{ fontWeight: '600', color: getProgressColor(stats.silhouetteScore) }}>
              {stats.silhouetteScore > 0 ? `${(stats.silhouetteScore * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${stats.silhouetteScore * 100}%`, 
              height: '100%', 
              background: getProgressColor(stats.silhouetteScore),
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#555' }}>Top 3 Characteristics per Segment</span>
            <span style={{ fontWeight: '600', color: stats.hasClustering ? '#28a745' : '#dc3545' }}>
              {stats.hasClustering ? 'Complete' : 'Pending'}
            </span>
          </div>
          <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: stats.hasClustering ? '100%' : '20%', 
              height: '100%', 
              background: stats.hasClustering ? '#28a745' : '#dc3545',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#555' }}>Conversion Rate Improvement Target 15%</span>
            <span style={{ fontWeight: '600', color: stats.hasClustering ? '#28a745' : '#dc3545' }}>
              {stats.hasClustering ? 'In Progress' : 'Pending'}
            </span>
          </div>
          <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: stats.hasClustering ? '80%' : '20%', 
              height: '100%', 
              background: stats.hasClustering ? '#28a745' : '#dc3545',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>

      <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.1rem' }}>Features</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {features.map((feature) => (
          <Link
            key={feature.path}
            to={feature.path}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              display: 'block',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderLeft: `4px solid ${feature.color}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <IconBox letter={feature.initial} color={feature.color} />
              <div>
                <h4 style={{ color: '#333', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{feature.title}</h4>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: feature.status === 'complete' ? '#d4edda' : '#fff3cd',
                  color: feature.status === 'complete' ? '#155724' : '#856404'
                }}>
                  {feature.status === 'complete' ? 'Ready' : 'Required'}
                </span>
              </div>
            </div>
            <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>{feature.description}</p>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>
        <h4 style={{ color: '#333', marginBottom: '0.5rem' }}>Quick Start Guide</h4>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          1. Upload data  - 2. Preprocess  - 3. Cluster  - 4. Analyze  - 5. View Segments  - 6. Get Reports
        </p>
        {!stats.hasData && (
          <Link
            to="/upload"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: '#4a90d9',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Get Started - Upload Data
          </Link>
        )}
        {stats.hasData && !stats.hasClustering && (
          <Link
            to="/clustering"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: '#4a90d9',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Continue - Run Clustering
          </Link>
        )}
      </div>
    </div>
  );
};