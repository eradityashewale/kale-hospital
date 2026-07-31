import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function DepartmentForm({ close }) {
  const { doctors, refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      await apiFetch('/departments', { method: 'POST', body: JSON.stringify({ name: data.get('name'), head: data.get('head') }) });
      showToast(`${data.get('name')} department created.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Department name" name="name" required full />
        <FormField label="Head of department" name="head" type="select" required options={doctors.map((d) => d.name)} />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Add department</button>
      </div>
    </form>
  );
}
