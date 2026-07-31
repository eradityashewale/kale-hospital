import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm, todayISO, addDaysISO } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function DischargeForm({ close, admission }) {
  const { refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      await apiFetch(`/ipd/${admission.id}/discharge`, {
        method: 'POST',
        body: JSON.stringify({ dischargeDate: data.get('dischargeDate'), summary: data.get('summary'), followUp: data.get('followUp') }),
      });
      showToast(`${admission.patient} discharged successfully.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid cols-1">
        <p className="field-hint">{admission.patient} · {admission.ward} · Bed {admission.bed}</p>
        <FormField label="Discharge date" name="dischargeDate" type="date" defaultValue={todayISO()} required />
        <FormField label="Discharge summary / recommendation" name="summary" type="textarea" rows={3} required />
        <FormField label="Follow-up date" name="followUp" type="date" defaultValue={addDaysISO(7)} />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Confirm discharge</button>
      </div>
    </form>
  );
}
