import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function BedFloorForm({ close, buildingId, floor }) {
  const { refresh } = useData();
  const showToast = useToast();
  const isEdit = Boolean(floor);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    const payload = { name: data.get('name'), type: data.get('type') };
    try {
      if (isEdit) {
        await apiFetch(`/beds/floors/${floor.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        showToast('Floor updated.', 'success');
      } else {
        await apiFetch(`/beds/buildings/${buildingId}/floors`, { method: 'POST', body: JSON.stringify(payload) });
        showToast('Floor added.', 'success');
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
        <FormField label="Floor name" name="name" defaultValue={floor?.floor || ''} placeholder="e.g. 3rd Floor" required full />
        <FormField label="Ward / type" name="type" defaultValue={floor?.type || ''} placeholder="e.g. General Ward" required full />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">{isEdit ? 'Save changes' : 'Add floor'}</button>
      </div>
    </form>
  );
}
