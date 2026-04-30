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
        <LoginForm onSuccess={handleSuccess} />
        <p className="auth-switch">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};