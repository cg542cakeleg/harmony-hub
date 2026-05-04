import { useState, useCallback, useEffect, useRef } from 'react';
import { C } from '../hooks/use-harmony-data';
import { Pixel, Mono, Button, scanlinesBg, insetStyle } from './RetroUI';
import { csrfFetch } from '@workspace/replit-auth-web';

interface LoginScreenProps {
  onSuccess: () => void;
}

type Mode = 'choose' | 'login' | 'register' | 'forgot' | 'reset' | 'forgot-sent';

const inputStyle: React.CSSProperties = {
  ...insetStyle('#fff'),
  width: '100%',
  padding: '10px 12px',
  fontFamily: "'VT323', monospace",
  fontSize: 20,
  color: C.navy,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'VT323', monospace",
  fontSize: 16,
  color: C.navy,
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: 4,
};

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ background: C.red, border: `2px solid ${C.navy}`, padding: '8px 12px' }}>
      <Mono style={{ fontSize: 14, color: '#fff' }}>{msg}</Mono>
    </div>
  );
}

function SuccessBox({ msg }: { msg: string }) {
  return (
    <div style={{ background: C.green, border: `2px solid ${C.navy}`, padding: '8px 12px' }}>
      <Mono style={{ fontSize: 14, color: '#fff' }}>{msg}</Mono>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      <Mono style={{ fontSize: 18, color: C.navy }}>←</Mono>
    </button>
  );
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<Mode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const lockoutTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (m: Mode) => { setMode(m); setError(''); setSuccess(''); setLockoutSeconds(0); };

  const startLockoutCountdown = useCallback((seconds: number) => {
    setLockoutSeconds(seconds);
    if (lockoutTimer.current) clearInterval(lockoutTimer.current);
    lockoutTimer.current = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(lockoutTimer.current!);
          lockoutTimer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (lockoutTimer.current) clearInterval(lockoutTimer.current); }, []);

  // Check URL for reset token on mount
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setMode('reset');
    }
  });

  const handleGoogleLogin = useCallback(() => {
    window.location.href = '/api/auth/google';
  }, []);

  const handleEmailLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await csrfFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg: string = data.error ?? 'Login failed.';
        setError(msg);
        // Parse "locked for N minutes" and start a visible countdown
        const minsMatch = msg.match(/(\d+)\s*minute/);
        if (minsMatch) startLockoutCountdown(parseInt(minsMatch[1], 10) * 60);
      } else {
        onSuccess();
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }, [email, password, onSuccess, startLockoutCountdown]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await csrfFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Registration failed.'); }
      else { onSuccess(); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }, [email, password, firstName, lastName, onSuccess]);

  const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await csrfFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Request failed.'); }
      else { go('forgot-sent'); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }, [email]);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await csrfFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Reset failed.'); }
      else {
        // Clear token from URL
        window.history.replaceState({}, '', window.location.pathname);
        setSuccess('Password reset! Please log in.');
        go('login');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }, [resetToken, newPassword]);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh', background: C.bg, ...scanlinesBg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Courier New', monospace", padding: 20,
  };

  const windowStyle: React.CSSProperties = {
    width: '100%', maxWidth: 460,
    border: `5px solid ${C.navy}`, boxShadow: `10px 10px 0 ${C.navy}`,
    background: C.cream, display: 'flex', flexDirection: 'column',
  };

  const dividerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 };
  const dividerLineStyle: React.CSSProperties = { flex: 1, height: 2, background: C.navy };

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .blink { animation: blink 1s step-end infinite; }
      `}</style>
      <div style={windowStyle}>
        {/* Title Bar */}
        <div style={{ background: C.gold, borderBottom: `4px solid ${C.navy}`, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[C.red, C.orange, C.green].map((col, i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: col, border: `2px solid ${C.navy}` }} />
            ))}
          </div>
          <Pixel size={18} color={C.navy} style={{ flex: 1, textAlign: 'center' }}>
            HARMONY HUB — FAMILY OS
          </Pixel>
        </div>

        {/* Boot panel */}
        <div style={{ background: C.navy, padding: '18px 28px', borderBottom: `4px solid ${C.navy}`, textAlign: 'center' }}>
          <Pixel size={36} color={C.gold} style={{ display: 'block', letterSpacing: '0.05em' }}>HARMONY HUB</Pixel>
          <Mono style={{ fontSize: 12, color: C.cream, marginTop: 4, letterSpacing: '0.12em', display: 'block' }}>FAMILY MANAGEMENT SYSTEM v2.0</Mono>
          <Mono style={{ fontSize: 11, color: C.green, marginTop: 8, display: 'block' }}>SYSTEM READY<span className="blink">_</span></Mono>
        </div>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── CHOOSE ── */}
          {mode === 'choose' && (
            <>
              <div style={{ textAlign: 'center' }}>
                <Pixel size={22} color={C.navy} style={{ display: 'block' }}>SELECT LOGIN METHOD</Pixel>
                <Mono style={{ fontSize: 13, color: '#666', marginTop: 6 }}>Sign in to access your family dashboard</Mono>
              </div>
              <button onClick={handleGoogleLogin} data-testid="btn-google-login" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                width: '100%', padding: '12px 20px', background: '#fff',
                border: `3px solid ${C.navy}`, boxShadow: `4px 4px 0 ${C.navy}`,
                cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: 20,
                color: C.navy, letterSpacing: '0.05em',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>
              <div style={dividerStyle}>
                <div style={dividerLineStyle} />
                <Mono style={{ fontSize: 13, color: '#888' }}>OR</Mono>
                <div style={dividerLineStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button onClick={() => go('login')} bg={C.navy} style={{ flex: 1, padding: '10px 0' }} testId="btn-email-login">
                  <Pixel size={18} color={C.gold}>EMAIL LOGIN</Pixel>
                </Button>
                <Button onClick={() => go('register')} bg={C.blue} style={{ flex: 1, padding: '10px 0' }} testId="btn-register">
                  <Pixel size={18} color={C.white}>REGISTER</Pixel>
                </Button>
              </div>
            </>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BackButton onClick={() => go('choose')} />
                <Pixel size={22} color={C.navy}>EMAIL LOGIN</Pixel>
              </div>
              <div>
                <label style={labelStyle}>EMAIL ADDRESS</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
                  data-testid="input-email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>PASSWORD</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  data-testid="input-password" style={inputStyle} />
              </div>
              {success && <SuccessBox msg={success} />}
              {error && <ErrorBox msg={error} />}
              {lockoutSeconds > 0 && (
                <div style={{ background: C.orange, border: `2px solid ${C.navy}`, padding: '8px 12px', textAlign: 'center' }}>
                  <Mono style={{ fontSize: 14, color: C.navy }}>
                    RETRY IN {Math.floor(lockoutSeconds / 60)}:{String(lockoutSeconds % 60).padStart(2, '0')}
                  </Mono>
                </div>
              )}
              <Button type="submit" bg={C.navy} style={{ padding: '12px 0', width: '100%' }}
                testId="btn-submit-login" disabled={lockoutSeconds > 0}>
                <Pixel size={20} color={C.gold}>{loading ? 'LOGGING IN...' : 'LOG IN'}</Pixel>
              </Button>
              <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
                <Mono style={{ fontSize: 13, color: '#666' }}>
                  No account?{' '}
                  <span onClick={() => go('register')} style={{ color: C.blue, cursor: 'pointer', textDecoration: 'underline' }}>REGISTER</span>
                </Mono>
                <Mono style={{ fontSize: 13, color: '#666' }}>
                  <span onClick={() => go('forgot')} style={{ color: C.navy, cursor: 'pointer', textDecoration: 'underline' }} data-testid="link-forgot-password">FORGOT?</span>
                </Mono>
              </div>
            </form>
          )}

          {/* ── REGISTER ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BackButton onClick={() => go('choose')} />
                <Pixel size={22} color={C.navy}>CREATE ACCOUNT</Pixel>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>FIRST NAME</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="Cleta" autoComplete="given-name"
                    data-testid="input-first-name" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>LAST NAME</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Gann" autoComplete="family-name"
                    data-testid="input-last-name" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>EMAIL ADDRESS</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
                  data-testid="input-reg-email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>PASSWORD (MIN 8 CHARS)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={8} autoComplete="new-password"
                  data-testid="input-reg-password" style={inputStyle} />
              </div>
              {error && <ErrorBox msg={error} />}
              <Button type="submit" bg={C.green} style={{ padding: '12px 0', width: '100%' }} testId="btn-submit-register">
                <Pixel size={20} color={C.white}>{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</Pixel>
              </Button>
              <div style={{ textAlign: 'center' }}>
                <Mono style={{ fontSize: 13, color: '#666' }}>
                  Have an account?{' '}
                  <span onClick={() => go('login')} style={{ color: C.navy, cursor: 'pointer', textDecoration: 'underline' }}>LOG IN</span>
                </Mono>
              </div>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BackButton onClick={() => go('login')} />
                <Pixel size={22} color={C.navy}>RESET PASSWORD</Pixel>
              </div>
              <Mono style={{ fontSize: 13, color: '#666' }}>
                Enter your email and we'll send a reset link.
              </Mono>
              <div>
                <label style={labelStyle}>EMAIL ADDRESS</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
                  data-testid="input-forgot-email" style={inputStyle} />
              </div>
              {error && <ErrorBox msg={error} />}
              <Button type="submit" bg={C.navy} style={{ padding: '12px 0', width: '100%' }} testId="btn-submit-forgot">
                <Pixel size={20} color={C.gold}>{loading ? 'SENDING...' : 'SEND RESET LINK'}</Pixel>
              </Button>
            </form>
          )}

          {/* ── FORGOT SENT ── */}
          {mode === 'forgot-sent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
              <Pixel size={48} color={C.green} style={{ display: 'block' }}>✓</Pixel>
              <Pixel size={22} color={C.navy}>CHECK YOUR EMAIL</Pixel>
              <Mono style={{ fontSize: 13, color: '#666' }}>
                If that address is registered, a password reset link has been sent.
              </Mono>
              <Button onClick={() => go('login')} bg={C.navy} style={{ padding: '10px 0' }} testId="btn-back-to-login">
                <Pixel size={18} color={C.gold}>BACK TO LOGIN</Pixel>
              </Button>
            </div>
          )}

          {/* ── RESET PASSWORD ── */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Pixel size={22} color={C.navy}>SET NEW PASSWORD</Pixel>
              <div>
                <label style={labelStyle}>NEW PASSWORD (MIN 8 CHARS)</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••" required minLength={8} autoComplete="new-password"
                  data-testid="input-new-password" style={inputStyle} />
              </div>
              {error && <ErrorBox msg={error} />}
              <Button type="submit" bg={C.green} style={{ padding: '12px 0', width: '100%' }} testId="btn-submit-reset">
                <Pixel size={20} color={C.white}>{loading ? 'RESETTING...' : 'RESET PASSWORD'}</Pixel>
              </Button>
            </form>
          )}

        </div>

        {/* Status bar */}
        <div style={{ background: C.navy, borderTop: `4px solid ${C.navy}`, padding: '4px 14px', display: 'flex', justifyContent: 'space-between' }}>
          <Mono style={{ fontSize: 11, color: C.green }}>● SECURE CONNECTION</Mono>
          <Mono style={{ fontSize: 11, color: C.cream }}>HARMONY HUB v2.0</Mono>
        </div>
      </div>
    </div>
  );
}
