import React, { useState } from 'react';
import '../login.css';
import { loginWithSupabase } from '../lib/supabase';

export default function LoginPage({ onLoginSuccess, onBackToHome }) {
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('1510');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fillCredential = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await loginWithSupabase(username, password);

      if (result.success && result.token) {
        sessionStorage.setItem('shs_auth_token', result.token);
        sessionStorage.setItem('shs_auth_user', JSON.stringify(result.user));
        sessionStorage.setItem('shs_admin_unlocked', 'true');
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        } else {
          window.location.hash = '#admin';
        }
      } else {
        setErrorMsg(result.message || 'Username atau password salah.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi Supabase: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modern-login-root">
      <div className="modern-login-card">
        {/* LEFT COLUMN: MINIMALIST HIGH-END LOGIN FORM */}
        <div className="modern-login-form-pane">
          {/* Brand Mark Header */}
          <div className="modern-brand-row">
            <img src="assets/logo_south.png" alt="South Hair Studio" className="modern-brand-logo" />
            <div className="modern-brand-meta">
              <span className="modern-brand-name">South Hair Studio</span>
              <span className="modern-brand-badge">Portal Admin &amp; Kasir</span>
            </div>
          </div>

          <h1 className="modern-login-title">Sign In</h1>
          <p className="modern-login-subtitle">Continue to access studio management dashboard</p>

          {errorMsg && (
            <div className="modern-alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="modern-form">
            <div className="modern-form-group">
              <label className="modern-form-label">Username atau ID Staf</label>
              <div className="modern-input-wrap">
                <span className="modern-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="Enter your email or username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modern-form-group">
              <div className="modern-form-label-row">
                <label className="modern-form-label">Password / PIN</label>
                <button
                  type="button"
                  className="modern-forgot-link"
                  onClick={() => fillCredential('superadmin', '1510')}
                  title="Gunakan PIN Master 1510"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="modern-input-wrap">
                <span className="modern-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="modern-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="modern-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tampilkan Password"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="modern-btn-submit" disabled={isLoading}>
              <span>{isLoading ? 'Memverifikasi...' : 'Sign In'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <a
              href="#"
              className="modern-back-link"
              onClick={(e) => {
                e.preventDefault();
                if (onBackToHome) onBackToHome();
                else window.location.hash = '';
              }}
            >
              &larr; Kembali ke Beranda Studio
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: EDITORIAL DITHER HALFTONE ART */}
        <div className="modern-login-art-pane" aria-hidden="true">
          <img
            src="assets/login_halftone_art.png"
            alt="Editorial Halftone Artwork"
            className="modern-art-img"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
