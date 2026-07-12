import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { FaSun, FaMoon, FaSignInAlt, FaEye, FaEyeSlash, FaPaperPlane } from 'react-icons/fa';
import '../../styles/login.css';

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password flow states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [simulatedLink, setSimulatedLink] = useState('');

  // Status states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Theme states
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleModeChange = () => {
    setIsForgotPassword(prev => !prev);
    setError('');
    setSuccess('');
    setSimulatedLink('');
    setUsername('');
    setPassword('');
    setResetEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSimulatedLink('');
    setIsLoading(true);

    if (isForgotPassword) {
      // Forgot Password submission
      try {
        const res = await api.post('/api/auth/forgot-password', { username: resetEmail });
        setSuccess(res.data.message);
        if (res.data.resetLink) {
          setSimulatedLink(res.data.resetLink);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error processing request. Account might not exist.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Standard login
      try {
        await login(username, password);
        navigate('/dashboard');
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glass-card">
        {/* Theme Toggle inside the card at top-right */}
        <button 
          type="button"
          onClick={toggleTheme} 
          className="login-theme-toggle"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <FaSun style={{ color: '#fbbf24' }} /> : <FaMoon />}
        </button>

        <div className="login-header">
          <h1>Transit<span>Ops</span></h1>
          <p>Smart Transport Operations Platform</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error-alert">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="login-success-alert">
              <span>{success}</span>
              {simulatedLink && (
                <div style={{ marginTop: '12px' }}>
                  <a 
                    href={simulatedLink}
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    Click to Reset Password (Mock link)
                  </a>
                </div>
              )}
            </div>
          )}

          {isForgotPassword ? (
            // Forgot Password Form fields
            <div className="login-form-group">
              <label htmlFor="resetEmail">Email / Username</label>
              <input
                type="email"
                id="resetEmail"
                className="login-input"
                placeholder="e.g. user@transitops.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            // Login Form fields
            <>
              <div className="login-form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className="login-input"
                  placeholder="e.g. user@transitops.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="login-form-group" style={{ position: 'relative' }}>
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="login-input"
                    placeholder="e.g. ••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            </>
          )}

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              'Processing...'
            ) : isForgotPassword ? (
              <>
                <FaPaperPlane style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Request Reset Link
              </>
            ) : (
              <>
                <FaSignInAlt style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-mode-switch" style={{ marginTop: '16px' }}>
          <button type="button" onClick={handleModeChange}>
            {isForgotPassword ? 'Back to Sign In' : 'Forgot Password?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
