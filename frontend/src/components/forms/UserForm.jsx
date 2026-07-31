import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import { ALL_ROLES } from '../../nav.js';
import FormField from '../FormField.jsx';

export default function UserForm({ close }) {
  const { refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ name: data.get('name'), email: data.get('email'), role: data.get('role'), password: data.get('password') }),
      });
      showToast(`${data.get('name')} added as ${data.get('role')}.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Full name" name="name" required full />
        <FormField label="Email" name="email" type="email" required full />
        <FormField label="Role" name="role" type="select" required options={ALL_ROLES} />
        <FormField label="Temporary password" name="password" type="password" required defaultValue="password" />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Create account</button>
      </div>
    </form>
  );
}
