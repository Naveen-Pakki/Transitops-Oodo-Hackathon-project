import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    
    // Check if the saved token is still valid on app mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          const userData = res.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const { token, id, role } = res.data;
      
      const loggedUser = { id, username: res.data.username, role };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed. Please check credentials.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Helper roles checks
  const isFleetManager = () => user?.role === 'FLEET_MANAGER';
  const isDispatcher = () => user?.role === 'DISPATCHER';
  const isSafetyOfficer = () => user?.role === 'SAFETY_OFFICER';
  const isFinancialAnalyst = () => user?.role === 'FINANCIAL_ANALYST';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isFleetManager,
      isDispatcher,
      isSafetyOfficer,
      isFinancialAnalyst
    }}>
      {children}
    </AuthContext.Provider>
  );
};
