import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/upload', label: 'Data Upload' },
    { path: '/preprocess', label: 'Preprocessing' },
    { path: '/clustering', label: 'Clustering' },
    { path: '/segments', label: 'Segments' },
    { path: '/reports', label: 'Reports' },
    { path: '/analysis', label: 'Analysis' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">ECOMP</Link>
      </div>
      <div className="navbar-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="navbar-user">
        <span>{user?.username}</span>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};