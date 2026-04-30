import React, { useState } from 'react';
import { UploadZone } from '../components/UploadZone';
import { DataPreview } from '../components/DataPreview';
import { SyntheticGenerator } from '../components/SyntheticGenerator';
import { dataApi } from '../api/dataApi';
import { DataUploadResponse } from '../../types/data';

export const UploadPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<DataUploadResponse | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);

  const handleFileSelect = async (file: File) => {
    setError('');
    setIsLoading(true);
    setRowCount(null);
    
    alert(`Uploading: ${file.name} (${file.size} bytes)`);
    
    try {
      console.log('Uploading file:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/data/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Upload failed');
      }
      
      const responseData = await response.json();
      console.log('=== UPLOAD RESPONSE ===');
      console.log('total_rows in response:', responseData.stats?.total_rows);
      console.log('full_data length:', responseData.full_data?.length);
      console.log('preview length:', responseData.preview?.length);
      console.log('first row full_data:', responseData.full_data?.[0]);
      console.log('first row preview:', responseData.preview?.[0]);
      console.log('=======================');
      setData(responseData);
      
      localStorage.removeItem('currentData');
      localStorage.removeItem('processedData');
      localStorage.removeItem('clusteringResult');
      localStorage.removeItem('dataStats');
      
      const dataToSave = responseData.full_data || responseData.preview;
      if (dataToSave) {
        console.log('BEFORE SAVE - dataToSave length:', dataToSave.length);
        console.log('BEFORE SAVE - first row:', dataToSave[0]);
        
        localStorage.setItem('currentData', JSON.stringify(dataToSave));
        localStorage.setItem('dataStats', JSON.stringify(responseData.stats));
        localStorage.setItem('dataReady', 'true');
        localStorage.setItem('dataSource', 'uploaded');
        setRowCount(dataToSave.length);
        
        // Verify what was actually saved
        const verify = localStorage.getItem('currentData');
        if (verify) {
          const parsed = JSON.parse(verify);
          console.log('AFTER SAVE - localStorage length:', parsed.length);
          console.log('AFTER SAVE - first row:', parsed[0]);
        }
      } else {
        setError('No data returned from server');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      console.log('Error response:', err.response?.data);
      alert(`Upload error: ${err.response?.data?.error || err.message || err}`);
      setError(err.response?.data?.error || err.message || 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (numCustomers: number) => {
    setError('');
    setIsLoading(true);
    setRowCount(null);
    
    localStorage.removeItem('currentData');
    localStorage.removeItem('processedData');
    localStorage.removeItem('clusteringResult');
    
    try {
      console.log('Generating synthetic data...');
      const response = await dataApi.generateSynthetic(numCustomers);
      console.log('Generate response:', response);
      setData(response);
      
      const dataToSave = response.full_data || response.preview;
      if (dataToSave) {
        localStorage.setItem('currentData', JSON.stringify(dataToSave));
        localStorage.setItem('dataStats', JSON.stringify(response.stats));
        localStorage.setItem('dataReady', 'true');
        localStorage.setItem('dataSource', 'synthetic');
        setRowCount(dataToSave.length);
        console.log('Saved', dataToSave.length, 'rows to localStorage');
      } else {
        setError('No data returned from server');
      }
    } catch (err: any) {
      console.error('Generate error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="page-header">
        <h1>Data Upload</h1>
        <p>Upload your customer data or generate synthetic data for demo</p>
        {data && rowCount && (
          <div className="success-message" style={{ marginTop: '1rem', padding: '0.75rem', background: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
            {rowCount} rows loaded! Go to <strong>Preprocessing</strong> to process this data.
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="upload-sections">
        <div className="upload-section">
          <h2>Upload CSV File</h2>
          <UploadZone onFileSelect={handleFileSelect} isLoading={isLoading} />
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="generator-section">
          <SyntheticGenerator onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
      </div>

      {data && (
        <DataPreview preview={data.preview} stats={data.stats} />
      )}
    </div>
  );
};