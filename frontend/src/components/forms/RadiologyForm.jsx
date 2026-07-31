import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function RadiologyForm({ close }) {
  const { patients, doctors, refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      const test = await apiFetch('/radiology-tests', {
        method: 'POST',
        body: JSON.stringify({ patientId: data.get('patientId'), type: data.get('type'), doctor: data.get('doctor') }),
      });
      showToast(`${test.type} scan booked for ${test.patient}.`, 'success');
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
        <FormField label="Scan type" name="type" type="select" required options={['X-Ray', 'MRI', 'CT Scan', 'Ultrasound']} />
        <FormField label="Referring doctor" name="doctor" type="select" required options={doctors.map((d) => d.name)} />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Book scan</button>
      </div>
    </form>
  );
}
