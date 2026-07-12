import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        height: '100vh',
        background: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div className="spinner"></div>
        <div style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text-muted)' }}>Loading TransitOps...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user role is unauthorized for this route
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
