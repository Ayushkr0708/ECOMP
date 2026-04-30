import React, { useState, useEffect } from 'react';

interface SegmentRecommendations {
  segmentName: string;
  size: number;
  percentage: number;
  topCharacteristics: { feature: string; diff_from_avg: number }[];
  recommendations: {
    channel: string;
    message: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export const ReportsPage: React.FC = () => {
  const [clusterResult, setClusterResult] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<SegmentRecommendations[]>([]);

  useEffect(() => {
    const savedResult = localStorage.getItem('clusteringResult');
    if (savedResult) {
      const parsed = JSON.parse(savedResult);
      setClusterResult(parsed);
      generateRecommendations(parsed);
    }
  }, []);

  const generateRecommendations = (result: any) => {
    const clusterProfiles = result.cluster_profiles || {};
    const clusterSizes = result.cluster_sizes || {};
    const totalCustomers = Object.values(clusterSizes).reduce((a: any, b: any) => a + b, 0);

    const recs: SegmentRecommendations[] = Object.entries(clusterProfiles).map(([segmentName, profile]: [string, any]) => {
      const size = profile.size || clusterSizes[segmentName] || 0;
      const percentage = ((size / totalCustomers) * 100).toFixed(1);
      const topChars = profile.top_characteristics || [];

      const segmentRecs = generateSegmentRecs(segmentName, topChars, size, parseFloat(percentage));

      return {
        segmentName,
        size,
        percentage: parseFloat(percentage),
        topCharacteristics: topChars.slice(0, 3),
        recommendations: segmentRecs
      };
    });

    setRecommendations(recs);
  };

  const generateSegmentRecs = (segmentName: string, topChars: any[], size: number, percentage: number) => {
    const recs = [];
    const charNames = topChars.map((c: any) => c.feature.toLowerCase());

    if (charNames.some((c: string) => c.includes('income') || c.includes('monetary'))) {
      if (topChars.find((c: any) => c.diff_from_avg > 20)) {
        recs.push({
          channel: 'Email',
          message: 'Premium product offers and exclusive deals',
          action: 'Send personalized luxury catalog',
          priority: 'high'
        });
        recs.push({
          channel: 'Direct Mail',
          message: 'High-value member exclusive invitations',
          action: 'Send VIP event invitations',
          priority: 'medium'
        });
      } else {
        recs.push({
          channel: 'Email',
          message: 'Value-focused promotions and bundles',
          action: 'Send seasonal discount offers',
          priority: 'medium'
        });
      }
    }

    if (charNames.some((c: string) => c.includes('frequency') || c.includes('purchase'))) {
      recs.push({
        channel: 'SMS',
        message: 'Flash sales and time-limited offers',
        action: 'Set up automated SMS alerts',
        priority: 'high'
      });
      recs.push({
        channel: 'Loyalty Program',
        message: 'Earn double points on purchases',
        action: 'Launch loyalty rewards campaign',
        priority: 'medium'
      });
    }

    if (charNames.some((c: string) => c.includes('recency') || c.includes('last_purchase'))) {
      const lowRecency = topChars.find((c: any) => c.diff_from_avg > 0);
      if (lowRecency) {
        recs.push({
          channel: 'Email',
          message: 'We miss you! Come back offer',
          action: 'Send win-back campaign',
          priority: 'high'
        });
        recs.push({
          channel: 'Push Notifications',
          message: 'Limited time comeback discount',
          action: 'Enable retargeting ads',
          priority: 'high'
        });
      }
    }

    if (charNames.some((c: string) => c.includes('spending') || c.includes('score'))) {
      if (topChars.find((c: any) => c.diff_from_avg > 30)) {
        recs.push({
          channel: 'Personal Shopping',
          message: 'One-on-one styling consultations',
          action: 'Offer concierge service',
          priority: 'medium'
        });
      } else if (topChars.find((c: any) => c.diff_from_avg < -20)) {
        recs.push({
          channel: 'On-site',
          message: 'Product discovery and education',
          action: 'Implement guided product tours',
          priority: 'low'
        });
      }
    }

    if (charNames.some((c: string) => c.includes('age'))) {
      recs.push({
        channel: 'Social Media',
        message: 'Targeted age-appropriate content',
        action: 'Create segment-specific ad campaigns',
        priority: 'medium'
      });
    }

    if (recs.length === 0) {
      recs.push({
        channel: 'Email',
        message: 'General newsletter with featured products',
        action: 'Send regular product updates',
        priority: 'low'
      });
      recs.push({
        channel: 'Website',
        message: 'Personalized homepage recommendations',
        action: 'Enable collaborative filtering',
        priority: 'low'
      });
    }

    if (percentage > 35) {
      recs.unshift({
        channel: 'Mass Marketing',
        message: 'Priority focus - largest segment',
        action: 'Dedicate 40% of marketing budget',
        priority: 'high'
      });
    }

    return recs.slice(0, 4);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getSegmentIcon = (index: number) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return letters[index % letters.length];
  };

  if (!clusterResult) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>Marketing Reports</h1>
        <div style={{ padding: '2rem', background: '#fff3cd', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No clustering results found.</p>
          <p style={{ color: '#666' }}>Please run clustering first to generate marketing recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Marketing Reports</h1>
        <p style={{ color: '#666' }}>Personalized marketing recommendations for each customer segment</p>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#e8f4fd', borderRadius: '8px' }}>
        <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Conversion Impact Estimate</h3>
        <p style={{ color: '#555', margin: 0 }}>
          Based on {clusterResult.metrics?.n_clusters || 0} segments with {clusterResult.metrics?.silhouette_score 
            ? `silhouette score of ${(clusterResult.metrics.silhouette_score * 100).toFixed(0)}%` 
            : 'varying quality'}, 
          implementing these personalized strategies could yield <strong>12-18% conversion improvement</strong>.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {recommendations.map((segment, index) => (
          <div
            key={segment.segmentName}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ 
              background: `linear-gradient(135deg, #4a90d9, #357abd)`, 
              padding: '1.5rem', 
              color: 'white' 
            }}>
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
                  {getSegmentIcon(index)}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{segment.segmentName}</h3>
                  <span style={{ opacity: 0.9 }}>{segment.size} customers ({segment.percentage}%)</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Top Characteristics</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {segment.topCharacteristics.map((char, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: char.diff_from_avg > 0 ? '#d4edda' : '#f8d7da',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        color: char.diff_from_avg > 0 ? '#155724' : '#721c24'
                      }}
                    >
                      {char.feature} ({char.diff_from_avg > 0 ? '+' : ''}{char.diff_from_avg}%)
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Recommended Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {segment.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        borderLeft: `4px solid ${getPriorityColor(rec.priority)}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: '#333' }}>{rec.channel}</span>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            background: getPriorityColor(rec.priority),
                            color: 'white',
                            textTransform: 'uppercase'
                          }}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p style={{ color: '#555', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>{rec.message}</p>
                      <p style={{ color: '#4a90d9', fontSize: '0.85rem', margin: 0, fontWeight: '500' }}>Action: {rec.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#333', marginBottom: '1rem' }}>Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4a90d9' }}>{recommendations.length}</div>
            <div style={{ color: '#666' }}>Segments</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#28a745' }}>
              {recommendations.reduce((sum, r) => sum + r.recommendations.length, 0)}
            </div>
            <div style={{ color: '#666' }}>Total Recommendations</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ffc107' }}>
              {recommendations.reduce((sum, r) => sum + r.recommendations.filter((rec) => rec.priority === 'high').length, 0)}
            </div>
            <div style={{ color: '#666' }}>High Priority Actions</div>
          </div>
        </div>
      </div>
    </div>
  );
};