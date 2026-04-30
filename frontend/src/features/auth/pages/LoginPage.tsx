import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login to ECOMP</h1>
        <div style={{ background: '#e7f3ff', padding: '10px', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <strong>Demo Login:</strong><br />
          Username: <code>admin</code><br />
          Password: <code>admin123</code>
        </div>
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};