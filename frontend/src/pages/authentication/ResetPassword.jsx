import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaSun, FaMoon, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';
import '../../styles/login.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Missing token parameter in the URL.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, newPassword });
      setSuccess('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Token might be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glass-card">
        <button 
          onClick={toggleTheme} 
          className="login-theme-toggle"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <FaSun style={{ color: '#fbbf24' }} /> : <FaMoon />}
        </button>

        <div className="login-header">
          <h1>Reset <span>Password</span></h1>
          <p>Configure a new secure password for your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error-alert">{error}</div>}
          {success && <div className="login-success-alert">{success}</div>}

          <div className="login-form-group" style={{ position: 'relative' }}>
            <label htmlFor="newPassword">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                className="login-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="login-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={isLoading || !token}
          >
            {isLoading ? 'Resetting...' : (
              <>
                <FaKey style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Update Password
              </>
            )}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '24px' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
