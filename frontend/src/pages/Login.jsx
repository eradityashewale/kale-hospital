import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import ForgotPasswordForm from '../components/forms/ForgotPasswordForm.jsx';

const DEMO_ACCOUNTS = [
  ['Super Admin', 'superadmin@example.com'],
  ['Admin', 'admin@example.com'],
  ['Doctor', 'doctor@example.com'],
  ['Receptionist', 'receptionist@example.com'],
  ['Nurse', 'nurse@example.com'],
];

export default function Login() {
  const { user, initializing, login, loginWithTwoFactor } = useAuth();
  const showToast = useToast();
  const { toggleTheme } = useTheme();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [challengeToken, setChallengeToken] = useState('');
  const [code, setCode] = useState('');

  if (!initializing && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result?.requiresTwoFactor) {
        setChallengeToken(result.challengeToken);
        return;
      }
      showToast(`Welcome back, ${result.name}.`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please use the demo accounts below.');
      showToast(err.message || 'Invalid credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit2fa = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await loginWithTwoFactor(challengeToken, code);
      showToast(`Welcome back, ${loggedInUser.name}.`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid code.');
      showToast(err.message || 'Invalid code.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (challengeToken) {
    return (
      <section className="login-screen">
        <div className="login-card">
          <div className="brand-block">
            <div className="brand-badge">🔐</div>
            <div>
              <p className="eyebrow">Two-factor authentication</p>
              <h1>Enter your code</h1>
              <p>Open your authenticator app and enter the 6-digit code to finish signing in.</p>
            </div>
          </div>
          <form className="auth-form" onSubmit={onSubmit2fa}>
            <label>
              Authentication code
              <input type="text" inputMode="numeric" placeholder="123456" required minLength={6} maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
            </label>
            {error ? <p className="field-error">{error}</p> : null}
            <button className="primary-btn" type="submit" disabled={submitting}>Verify &amp; sign in</button>
            <button className="link-btn" type="button" onClick={() => { setChallengeToken(''); setCode(''); setError(''); }}>Back to sign in</button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="login-screen">
      <div className="login-card">
        <div className="brand-block">
          <div className="brand-badge">✚</div>
          <div>
            <p className="eyebrow">Multi-specialty healthcare platform</p>
            <h1>Kale Surgical Hospital</h1>
            <p>Secure, elegant, and scalable operations for modern care teams.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Email
            <input type="email" placeholder="name@hospital.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" placeholder="Enter password" required minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error ? <p className="field-error">{error}</p> : null}
          <button className="primary-btn" type="submit" disabled={submitting}>Sign in</button>
        </form>

        <p className="demo-label">Quick demo access</p>
        <div className="demo-grid">
          {DEMO_ACCOUNTS.map(([role, demoEmail]) => (
            <button
              key={demoEmail}
              className="ghost-btn"
              type="button"
              onClick={() => { setEmail(demoEmail); setPassword('password'); }}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="auth-links">
          <button className="link-btn" type="button" onClick={() => openModal('Reset your password', (close) => <ForgotPasswordForm close={close} />)}>Forgot password?</button>
          <button className="link-btn" type="button" onClick={toggleTheme}>Toggle theme</button>
        </div>
      </div>
    </section>
  );
}
