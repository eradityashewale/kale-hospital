import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

const ROLE_LABELS = { doctors: 'Doctor', nurses: 'Nurse', receptionists: 'Receptionist', labTechs: 'Lab Technician', pharmacists: 'Pharmacist' };

export default function StaffForm({ close, role }) {
  const { departments, refresh } = useData();
  const showToast = useToast();
  const label = ROLE_LABELS[role] || 'Staff member';

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      await apiFetch(`/staff/${role}`, {
        method: 'POST',
        body: JSON.stringify({
          name: data.get('name'), department: data.get('department') || '', specialization: data.get('specialization') || '',
          shift: data.get('shift'), phone: data.get('phone'),
        }),
      });
      showToast(`${data.get('name')} added as ${label}.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Full name" name="name" required full />
        {role === 'doctors' ? <FormField label="Department" name="department" type="select" options={departments.map((d) => d.name)} /> : null}
        {role === 'doctors' ? <FormField label="Specialization" name="specialization" /> : null}
        <FormField label="Shift" name="shift" type="select" options={['Morning', 'Evening', 'Night']} />
        <FormField label="Phone" name="phone" required />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Add {label}</button>
      </div>
    </form>
  );
}
