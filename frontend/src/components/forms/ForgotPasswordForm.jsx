import { useState } from 'react';
import { apiFetch } from '../../api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ForgotPasswordForm({ close }) {
  const showToast = useToast();
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      showToast(result.message, 'success');
      setStep('reset');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
      showToast('Password reset. You can now sign in with your new password.', 'success');
      close();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'request') {
    return (
      <form className="modal-form" onSubmit={requestCode}>
        <div className="form-grid">
          <label className="form-full">
            Account email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@hospital.com" />
          </label>
        </div>
        <p className="field-hint">
          A reset code will be generated and sent to your hospital's admin team, who can share it with you.
        </p>
        <div className="modal-footer">
          <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
          <button className="primary-btn" type="submit" disabled={submitting}>Request reset code</button>
          <button className="link-btn" type="button" onClick={() => setStep('reset')}>Already have a code?</button>
        </div>
      </form>
    );
  }

  return (
    <form className="modal-form" onSubmit={resetPassword}>
      <div className="form-grid">
        <label className="form-full">
          Reset code
          <input required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the code from your admin" />
        </label>
        <label className="form-full">
          New password
          <input type="password" required minLength={4} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit" disabled={submitting}>Reset password</button>
      </div>
    </form>
  );
}
