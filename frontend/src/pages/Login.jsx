import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const DEMO_ACCOUNTS = [
  ['Super Admin', 'superadmin@example.com'],
  ['Admin', 'admin@example.com'],
  ['Doctor', 'doctor@example.com'],
  ['Receptionist', 'receptionist@example.com'],
  ['Nurse', 'nurse@example.com'],
];

export default function Login() {
  const { user, initializing, login } = useAuth();
  const showToast = useToast();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!initializing && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      showToast(`Welcome back, ${loggedInUser.name}.`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please use the demo accounts below.');
      showToast(err.message || 'Invalid credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
          <button className="link-btn" type="button" onClick={() => showToast('Password reset link sent to the registered email.', 'success')}>Forgot password?</button>
          <button className="link-btn" type="button" onClick={toggleTheme}>Toggle theme</button>
        </div>
      </div>
    </section>
  );
}
