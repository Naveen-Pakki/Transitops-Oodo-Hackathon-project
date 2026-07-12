import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { FaUserCircle, FaSun, FaMoon } from 'react-icons/fa';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { currency, changeCurrency } = useContext(CurrencyContext);
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Helper to format path name as title
  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'FLEET_MANAGER': return 'Fleet Manager';
      case 'DISPATCHER': return 'Dispatcher';
      case 'SAFETY_OFFICER': return 'Safety Officer';
      case 'FINANCIAL_ANALYST': return 'Financial Analyst';
      default: return role;
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{getPageTitle()}</h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Currency Switcher */}
        <select 
          value={currency} 
          onChange={(e) => changeCurrency(e.target.value)}
          className="currency-select"
          title="Select Currency"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="INR">INR (₹)</option>
        </select>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <FaSun style={{ color: '#fbbf24' }} /> : <FaMoon />}
        </button>

        {user && (
          <div className="navbar-user">
            <div className="user-details">
              <span className="username">{user.username}</span>
              <span className={`role-badge ${user.role.toLowerCase()}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            <FaUserCircle className="user-avatar" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
