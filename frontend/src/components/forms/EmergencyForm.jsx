import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function EmergencyForm({ close }) {
  const { doctors, refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      await apiFetch('/emergency', {
        method: 'POST',
        body: JSON.stringify({
          patient: data.get('patient'), condition: data.get('condition'), doctor: data.get('doctor'),
          ambulance: data.get('ambulance'), triage: data.get('triage'), notes: data.get('notes') || '',
        }),
      });
      showToast(`Emergency case registered for ${data.get('patient')}.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Patient name" name="patient" required placeholder='Name or "Unknown"' />
        <FormField label="Condition" name="condition" type="select" options={['Critical', 'Serious', 'Stable']} />
        <FormField label="Emergency doctor" name="doctor" type="select" required options={doctors.map((d) => d.name)} />
        <FormField label="Ambulance used" name="ambulance" type="select" options={['Yes', 'No']} />
        <FormField label="Triage level" name="triage" type="select" options={['Level 1 — Immediate', 'Level 2 — Emergent', 'Level 3 — Urgent', 'Level 4 — Standard']} />
        <FormField label="Emergency notes" name="notes" type="textarea" rows={3} full />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Register case</button>
      </div>
    </form>
  );
}
