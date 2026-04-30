import React, { useState } from 'react';

interface SyntheticGeneratorProps {
  onGenerate: (numCustomers: number) => void;
  isLoading?: boolean;
}

export const SyntheticGenerator: React.FC<SyntheticGeneratorProps> = ({ onGenerate, isLoading }) => {
  const [numCustomers, setNumCustomers] = useState(1000);

  const handleGenerate = () => {
    onGenerate(numCustomers);
  };

  return (
    <div className="synthetic-generator">
      <h3>Generate Synthetic Data</h3>
      <p className="generator-description">
        Create realistic synthetic customer data for testing and demo purposes.
      </p>
      
      <div className="generator-controls">
        <label htmlFor="numCustomers">Number of customers:</label>
        <input
          type="number"
          id="numCustomers"
          value={numCustomers}
          onChange={(e) => setNumCustomers(Math.max(100, Math.min(50000, parseInt(e.target.value) || 1000)))}
          min={100}
          max={50000}
          disabled={isLoading}
        />
        
        <button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="generate-btn"
        >
          {isLoading ? 'Generating...' : 'Generate Data'}
        </button>
      </div>

      <div className="preset-buttons">
        <span>Presets:</span>
        <button onClick={() => setNumCustomers(500)} disabled={isLoading}>500</button>
        <button onClick={() => setNumCustomers(1000)} disabled={isLoading}>1,000</button>
        <button onClick={() => setNumCustomers(5000)} disabled={isLoading}>5,000</button>
        <button onClick={() => setNumCustomers(10000)} disabled={isLoading}>10,000</button>
      </div>
    </div>
  );
};