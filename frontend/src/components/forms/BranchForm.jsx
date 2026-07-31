import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function BranchForm({ close }) {
  const { refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      await apiFetch('/branches', {
        method: 'POST',
        body: JSON.stringify({ name: data.get('name'), location: data.get('location'), beds: Number(data.get('beds')) || 0, staff: Number(data.get('staff')) || 0 }),
      });
      showToast(`${data.get('name')} branch added.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Branch name" name="name" required />
        <FormField label="Location" name="location" required />
        <FormField label="Bed capacity" name="beds" type="number" defaultValue="50" />
        <FormField label="Staff count" name="staff" type="number" defaultValue="30" />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Add branch</button>
      </div>
    </form>
  );
}
