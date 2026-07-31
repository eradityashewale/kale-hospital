import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function BedBuildingForm({ close, building }) {
  const { refresh } = useData();
  const showToast = useToast();
  const isEdit = Boolean(building);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      if (isEdit) {
        await apiFetch(`/beds/buildings/${building.id}`, { method: 'PATCH', body: JSON.stringify({ name: data.get('name') }) });
        showToast('Building updated.', 'success');
      } else {
        await apiFetch('/beds/buildings', { method: 'POST', body: JSON.stringify({ name: data.get('name') }) });
        showToast('Building added.', 'success');
      }
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Building name" name="name" defaultValue={building?.building || ''} placeholder="e.g. East Wing" required full />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">{isEdit ? 'Save changes' : 'Add building'}</button>
      </div>
    </form>
  );
}
