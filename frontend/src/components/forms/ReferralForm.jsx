import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function ReferralForm({ close }) {
  const { patients, departments, refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    const patient = patients.find((p) => p.id === data.get('patientId'));
    try {
      await apiFetch('/referrals', {
        method: 'POST',
        body: JSON.stringify({ patientId: data.get('patientId'), department: data.get('department'), reason: data.get('reason') }),
      });
      showToast(`${patient?.name || 'Patient'} referred to ${data.get('department')}.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Patient" name="patientId" type="select" required options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` }))} />
        <FormField label="Refer to department" name="department" type="select" required options={departments.map((d) => d.name)} />
        <FormField label="Reason for referral" name="reason" type="textarea" rows={3} full required />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Send referral</button>
      </div>
    </form>
  );
}
