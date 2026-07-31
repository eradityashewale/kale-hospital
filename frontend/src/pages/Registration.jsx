import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { usePatientDrawer } from '../hooks/usePatientDrawer.jsx';
import { apiFetch } from '../api.js';
import { validateForm } from '../utils.js';
import FormField from '../components/FormField.jsx';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';

export default function Registration() {
  const { patients, departments, doctors, refresh } = useData();
  const showToast = useToast();
  const navigate = useNavigate();
  const openPatientDrawer = usePatientDrawer();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    const photoFile = data.get('photo');

    const submit = async (photoDataUrl) => {
      const payload = {
        name: data.get('name'), gender: data.get('gender'), dob: data.get('dob'), mobile: data.get('mobile'),
        altMobile: data.get('altMobile') || '', email: data.get('email') || '', address: data.get('address') || '',
        bloodGroup: data.get('bloodGroup'), aadhaar: data.get('aadhaar') || '', emergencyContact: data.get('emergencyContact') || '',
        insuranceProvider: data.get('insuranceProvider') || 'None', policyNo: data.get('policyNo') || '',
        allergies: data.get('allergies') || '', diseases: data.get('diseases') || '',
        department: data.get('department'), doctor: data.get('doctor'), photo: photoDataUrl || null,
      };
      try {
        const patient = await apiFetch('/patients', { method: 'POST', body: JSON.stringify(payload) });
        showToast(`${patient.name} registered as ${patient.id}.`, 'success');
        await refresh();
        form.reset();
        navigate('/patients');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    if (photoFile && photoFile.size > 0) {
      const reader = new FileReader();
      reader.onload = () => submit(reader.result);
      reader.readAsDataURL(photoFile);
    } else {
      await submit(null);
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Receptionist · Patient registration</p>
          <h2>Register a new patient in under a minute.</h2>
        </div>
      </div>
      <article className="card">
        <form className="modal-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <FormField label="Full name" name="name" required placeholder="e.g. Fatima Sheikh" />
            <FormField label="Gender" name="gender" type="select" options={['Female', 'Male', 'Other']} required />
            <FormField label="Date of birth" name="dob" type="date" required />
            <FormField label="Mobile number" name="mobile" required placeholder="+91 90000 00000" />
            <FormField label="Alternate mobile" name="altMobile" placeholder="Optional" />
            <FormField label="Email" name="email" type="email" placeholder="Optional" />
            <FormField label="Blood group" name="bloodGroup" type="select" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} required />
            <FormField label="Aadhaar number" name="aadhaar" placeholder="12-digit number" />
            <FormField label="Emergency contact" name="emergencyContact" placeholder="Name and phone" full />
            <FormField label="Address" name="address" type="textarea" rows={2} full />
            <FormField label="Insurance provider" name="insuranceProvider" placeholder="e.g. StarHealth" />
            <FormField label="Policy number" name="policyNo" placeholder="Optional" />
            <FormField label="Allergies" name="allergies" placeholder="Comma separated" full />
            <FormField label="Existing diseases" name="diseases" placeholder="Comma separated" full />
            <FormField label="Department" name="department" type="select" options={departments.map((d) => d.name)} required />
            <FormField label="Doctor" name="doctor" type="select" options={doctors.map((d) => d.name)} required />
            <label className="form-full">Photo upload<input type="file" name="photo" accept="image/*" /></label>
          </div>
          <div className="modal-footer">
            <button className="ghost-btn" type="reset">Clear form</button>
            <button className="primary-btn" type="submit">Register patient</button>
          </div>
        </form>
      </article>
      <DataTable
        title="Recently registered"
        rows={patients.slice(0, 10)}
        rowKey="id"
        onRowClick={(id) => openPatientDrawer(id)}
        pageSize={5}
        columns={[
          { key: 'id', label: 'Patient ID' },
          { key: 'name', label: 'Name' },
          { key: 'mobile', label: 'Mobile' },
          { key: 'department', label: 'Department' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
      />
    </>
  );
}
