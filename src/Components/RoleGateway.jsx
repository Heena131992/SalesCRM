import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import './RoleGateway.css';

export default function RoleGateway({ onLoginSuccess, onSelectUser, users = [] }) {
  const [email, setEmail] = useState('vikram@salespulse.in');
  const [password, setPassword] = useState('Welcome@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          'Backend /api/login route active nahi hai. Backend folder mein "node server.js" restart karein.'
        );
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      localStorage.setItem('salespulse_token', data.token);

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      } else if (onSelectUser) {
        onSelectUser(data.user.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Welcome@123');
    setError('');
  };

  return (
    <div className="gateway-wrapper">
      <div className="gateway-container" style={{ maxWidth: '460px' }}>
        <div className="gateway-header">
          <div className="gateway-badge">
            <Sparkles size={14} /> SalesPulse Enterprise CRM
          </div>
          <h1>Workspace Sign In</h1>
          <p>Enter your corporate email and password to access your portal.</p>
        </div>

        <div className="gateway-card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.84rem',
                  lineHeight: '1.4',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>
                Corporate Email
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="#94a3b8" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@salespulse.in"
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.35rem' }}>
              <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                }}
              >
                <Lock size={16} color="#94a3b8" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.65rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? 'Signing In...' : 'Sign In to Workspace'} <ArrowRight size={16} />
            </button>
          </form>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(148, 163, 184, 0.15)',
              fontSize: '0.78rem',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
            }}
          >
            <div
              onClick={() => fillDemoCredentials('vikram@salespulse.in')}
              style={{ cursor: 'pointer' }}
              title="Click to fill Admin credentials"
            >
              <strong>Admin:</strong> vikram@salespulse.in / Welcome@123
            </div>
            <div
              onClick={() => fillDemoCredentials('aarav@salespulse.in')}
              style={{ cursor: 'pointer' }}
              title="Click to fill Staff credentials"
            >
              <strong>Staff:</strong> aarav@salespulse.in / Welcome@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}