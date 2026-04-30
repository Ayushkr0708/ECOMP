import React, { useState, useRef } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`upload-zone ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        style={{ display: 'none' }}
        disabled={isLoading}
      />
      
      <div className="upload-icon">
        {isLoading ? 'Loading...' : 'Upload'}
      </div>
      
      <p className="upload-text">
        {isLoading 
          ? 'Uploading...' 
          : 'Drag and drop your CSV file here or click to browse'}
      </p>
      
      <p className="upload-hint">Only CSV files are accepted</p>
    </div>
  );
};