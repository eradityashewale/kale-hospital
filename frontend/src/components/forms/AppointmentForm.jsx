import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm, todayISO } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function AppointmentForm({ close }) {
  const { patients, departments, doctors, refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete all fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      const appt = await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId: data.get('patientId'), department: data.get('department'),
          doctor: data.get('doctor'), date: data.get('date'), time: data.get('time'),
        }),
      });
      showToast(`Appointment booked for ${appt.patient} — token ${appt.token}.`, 'success');
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
        <FormField label="Department" name="department" type="select" required options={departments.map((d) => d.name)} />
        <FormField label="Doctor" name="doctor" type="select" required options={doctors.map((d) => d.name)} />
        <FormField label="Date" name="date" type="date" defaultValue={todayISO()} required />
        <FormField label="Time slot" name="time" type="time" required />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Confirm booking</button>
      </div>
    </form>
  );
}
