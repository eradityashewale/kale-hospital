import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm, addDaysISO } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function PrescriptionForm({ close, presetPatientId }) {
  const { patients, refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    const patientId = data.get('patientId');
    try {
      const patient = await apiFetch(`/patients/${patientId}/prescriptions`, {
        method: 'POST',
        body: JSON.stringify({ diagnosis: data.get('diagnosis'), medicines: data.get('medicines'), followUp: data.get('followUp') || '—' }),
      });
      showToast(`Prescription saved for ${patient.name}.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Patient" name="patientId" type="select" required defaultValue={presetPatientId} options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` }))} />
        <FormField label="Diagnosis" name="diagnosis" full required />
        <FormField label="Medicines & dosage" name="medicines" type="textarea" rows={3} full required placeholder="e.g. Amoxicillin 500mg — 1-0-1 for 5 days" />
        <FormField label="Follow-up date" name="followUp" type="date" defaultValue={addDaysISO(14)} />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Save prescription</button>
      </div>
    </form>
  );
}
