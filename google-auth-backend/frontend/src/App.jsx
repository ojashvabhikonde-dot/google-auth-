import { useCallback, useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true,
});

export default function App({ googleConfigured = false }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const restoreSession = useCallback(async () => {
    setChecking(true);
    try {
      const { data } = await api.get('/api/auth/profile');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const signIn = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/google', { credential: credentialResponse.credential });
      setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the authentication server.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post('/api/auth/logout');
      setUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log out. Check that the API is running.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Northstar home"><span className="brand-mark">N</span><span>northstar</span></a>
        <span className="secure-label"><span className="secure-dot" /> Secure sign in</span>
      </header>

      <section className="auth-layout">
        <div className="intro">
          <span className="eyebrow">A calmer way to get started</span>
          <h1>Your work,<br /><em>in good company.</em></h1>
          <p>Sign in once and pick up right where you left off. Your account stays yours, securely.</p>
          <div className="trust-row"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span><span>Thoughtfully built around you</span></div>
        </div>

        <div className="login-card">
          <div className="card-topline"><span className="card-icon">✳</span><span className="card-kicker">YOUR PERSONAL SPACE</span></div>
          {checking ? (
            <div className="loading-state"><span className="spinner" /> Checking your session…</div>
          ) : user ? (
            <>
              <span className="eyebrow signed-in-label">YOU’RE SIGNED IN</span>
              <h2>Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}.</h2>
              <div className="profile-row">
                {user.picture ? <img className="profile-photo" src={user.picture} alt="" /> : <span className="profile-photo fallback">{user.name?.[0] || user.email?.[0]}</span>}
                <div><strong>{user.name}</strong><span>{user.email}</span></div>
                <span className="verified">✓</span>
              </div>
              <p className="card-copy">Your session is active. You can safely close this page and come back any time.</p>
              <button className="secondary-button" disabled={busy} onClick={signOut}>{busy ? 'Signing out…' : 'Sign out'}</button>
            </>
          ) : (
            <>
              <span className="eyebrow signed-in-label">WELCOME</span>
              <h2>Make yourself at home.</h2>
              <p className="card-copy">Use your Google account to sign in securely and continue.</p>
              {googleConfigured ? (
                <div className="google-button-wrap">
                  <GoogleLogin onSuccess={signIn} onError={() => setError('Google sign-in could not start. Please try again.')} theme="outline" size="large" shape="rectangular" text="continue_with" width="340" />
                </div>
              ) : (
                <section className="setup-note" aria-labelledby="setup-title">
                  <span className="setup-note-icon" aria-hidden="true">i</span>
                  <div>
                    <h3 id="setup-title">Google sign-in needs setup</h3>
                    <p>Add your Google OAuth client ID to <code>frontend/.env</code>:</p>
                    <code className="env-example">VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</code>
                    <p className="setup-hint">Get a Web application client ID from Google Cloud Console. Keep any client secret on the backend.</p>
                  </div>
                </section>
              )}
              {busy && <p className="subtle-status">Finishing your secure sign in…</p>}
              <div className="divider"><span>QUICK &amp; SECURE</span></div>
              <p className="privacy-note"><span>◈</span> Your password is never shared with this app.</p>
            </>
          )}
          {error && <p className="error-message" role="alert">{error}</p>}
          <div className="card-footer"><span>By continuing, you agree to our <a href="mailto:hello@example.com">Terms</a> and <a href="mailto:hello@example.com">Privacy Policy</a>.</span></div>
        </div>
      </section>
      <footer className="page-footer"><span>© 2026 Northstar</span><span>Made for your next chapter <b>✳</b></span></footer>
    </main>
  );
}
