import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

type Mode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const { login, register, isLoading, error: authError } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [formError, setFormError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!loginForm.username || !loginForm.password) {
      setFormError('Username and password required');
      return;
    }

    try {
      await login(loginForm.username, loginForm.password);
    } catch {
      // Error is handled by AuthContext
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setFormError('All fields required');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (registerForm.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      await register(registerForm.username, registerForm.email, registerForm.password, registerForm.confirmPassword);
    } catch {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>3D Change Order Manager</h1>
          <p>Streamlined change order generation and management</p>
        </div>

        {(formError || authError) && (
          <div className="error-message">
            {formError || authError}
          </div>
        )}

        {mode === 'login' ? (
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Sign In</h2>
            <div className="form-group">
              <label htmlFor="login-username">Username or Email</label>
              <input
                id="login-username"
                type="text"
                placeholder="your-username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            <div className="login-footer">
              <span>Don't have an account?</span>
              <button
                type="button"
                className="switch-mode-button"
                onClick={() => {
                  setMode('register');
                  setFormError(null);
                }}
              >
                Create one
              </button>
            </div>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleRegister}>
            <h2>Create Account</h2>
            <div className="form-group">
              <label htmlFor="register-username">Username</label>
              <input
                id="register-username"
                type="text"
                placeholder="your-username"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="••••••••"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="register-confirm">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                placeholder="••••••••"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div className="login-footer">
              <span>Already have an account?</span>
              <button
                type="button"
                className="switch-mode-button"
                onClick={() => {
                  setMode('login');
                  setFormError(null);
                }}
              >
                Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
