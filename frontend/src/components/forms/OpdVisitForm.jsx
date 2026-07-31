import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm, addDaysISO, todayISO } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function OpdVisitForm({ close, presetPatientId }) {
  const { patients, departments, doctors, refresh } = useData();
  const showToast = useToast();
  const preselect = presetPatientId ? patients.find((p) => p.id === presetPatientId) : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      const visit = await apiFetch('/opd', {
        method: 'POST',
        body: JSON.stringify({
          patientId: data.get('patientId'), department: data.get('department'), doctor: data.get('doctor'),
          fee: Number(data.get('fee')) || 0, symptoms: data.get('symptoms'), diagnosis: data.get('diagnosis'),
          prescription: data.get('prescription') || '', followUp: data.get('followUp') || '—', date: todayISO(),
        }),
      });
      showToast(`OPD visit ${visit.id} recorded for ${visit.patient}.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Patient" name="patientId" type="select" required defaultValue={preselect?.id} options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` }))} />
        <FormField label="Department" name="department" type="select" required defaultValue={preselect?.department} options={departments.map((d) => d.name)} />
        <FormField label="Doctor" name="doctor" type="select" required defaultValue={preselect?.doctor} options={doctors.map((d) => d.name)} />
        <FormField label="Consultation fee (₹)" name="fee" type="number" required defaultValue="500" />
        <FormField label="Follow-up date" name="followUp" type="date" defaultValue={addDaysISO(14)} />
        <FormField label="Symptoms" name="symptoms" type="textarea" rows={2} full required />
        <FormField label="Diagnosis" name="diagnosis" type="textarea" rows={2} full required />
        <FormField label="Prescription" name="prescription" type="textarea" rows={2} full />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Save OPD visit</button>
      </div>
    </form>
  );
}
