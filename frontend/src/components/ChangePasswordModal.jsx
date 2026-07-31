import { apiFetch } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { validateForm } from '../utils.js';
import FormField from './FormField.jsx';

export default function ChangePasswordModal({ close }) {
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete all fields.', 'error'); return; }
    const data = new FormData(form);
    if (data.get('next') !== data.get('confirm')) { showToast('New passwords do not match.', 'error'); return; }
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: data.get('current'), newPassword: data.get('next') }),
      });
      showToast('Password updated successfully.', 'success');
      close();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid cols-1">
        <FormField label="Current password" name="current" type="password" required />
        <FormField label="New password" name="next" type="password" required />
        <FormField label="Confirm new password" name="confirm" type="password" required />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Update password</button>
      </div>
    </form>
  );
}
