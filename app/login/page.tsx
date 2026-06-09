'use client';

import { useState, FormEvent } from 'react';
import { Eye, EyeOff, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicError, setMagicError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid password');
      }

      // Redirect to vault on success
      window.location.href = '/vault';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    setMagicLoading(true);
    setMagicError('');
    setMagicSent(false);

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send magic link');
      }

      setMagicSent(true);
    } catch (err) {
      setMagicError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setMagicLoading(false);
    }
  }

  return (
    <div
      style={{ backgroundColor: '#08090a' }}
      className="flex items-center justify-center min-h-screen"
    >
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        className="w-full max-w-sm rounded-xl p-8"
      >
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4"
            style={{ backgroundColor: '#5e6ad2' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Adam Vault</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Sign in to continue
          </p>
        </div>

        {/* Password error */}
        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email — readonly */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.9)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#5e6ad2'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm text-white outline-none transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#5e6ad2';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
                placeholder="••••••••"
                required
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity mt-2"
            style={{
              backgroundColor: '#5e6ad2',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <span className="mx-3 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>or</span>
          <div className="flex-1" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Magic link section */}
        {magicSent ? (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'rgba(94,106,210,0.08)',
              border: '1px solid rgba(94,106,210,0.25)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <Mail size={16} className="mt-0.5 shrink-0" style={{ color: '#5e6ad2' }} />
            <div>
              <p className="font-medium text-white">Check your email</p>
              <p className="mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                A magic link was sent to {email}
              </p>
            </div>
          </div>
        ) : (
          <>
            {magicError && (
              <div
                className="mb-3 px-4 py-3 rounded-lg text-sm"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#fca5a5',
                }}
              >
                {magicError}
              </div>
            )}
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={magicLoading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: magicLoading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
                cursor: magicLoading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!magicLoading) {
                  e.currentTarget.style.borderColor = 'rgba(94,106,210,0.5)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = magicLoading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)';
              }}
            >
              {magicLoading ? 'Sending…' : 'Send Magic Link'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
