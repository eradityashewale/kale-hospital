import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm, todayISO } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function AdmissionForm({ close, presetPatientId }) {
  const { patients, doctors, refresh } = useData();
  const showToast = useToast();
  const preselect = presetPatientId ? patients.find((p) => p.id === presetPatientId) : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      const admission = await apiFetch('/ipd', {
        method: 'POST',
        body: JSON.stringify({
          patientId: data.get('patientId'), ward: data.get('ward'), room: data.get('room'), bed: data.get('bed'),
          admissionDate: data.get('admissionDate'), doctor: data.get('doctor'), treatment: data.get('treatment'),
        }),
      });
      showToast(`${admission.patient} admitted to ${admission.ward}, bed ${admission.bed}.`, 'success');
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
        <FormField label="Ward" name="ward" type="select" required options={['Ward 1', 'Ward 2', 'Ward 4', 'ICU', 'NICU']} />
        <FormField label="Room" name="room" required placeholder="e.g. 402" />
        <FormField label="Bed" name="bed" required placeholder="e.g. B1" />
        <FormField label="Admission date" name="admissionDate" type="date" defaultValue={todayISO()} required />
        <FormField label="Doctor" name="doctor" type="select" required defaultValue={preselect?.doctor} options={doctors.map((d) => d.name)} />
        <FormField label="Treatment plan" name="treatment" type="textarea" rows={2} full required />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Admit patient</button>
      </div>
    </form>
  );
}
