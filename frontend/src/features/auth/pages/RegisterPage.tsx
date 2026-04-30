import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        <RegisterForm onSuccess={handleSuccess} />
        <p className="auth-switch">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};