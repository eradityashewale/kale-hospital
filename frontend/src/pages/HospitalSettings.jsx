import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import FormField from '../components/FormField.jsx';

export default function HospitalSettings() {
  const { settings, refresh } = useData();
  const showToast = useToast();
  const hospital = settings.hospital || {};

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    try {
      await apiFetch('/settings/hospital', { method: 'PUT', body: JSON.stringify({ values: Object.fromEntries(data.entries()) }) });
      showToast('Settings saved successfully.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="grid-2">
      <article className="card">
        <div className="card-head"><h3>Hospital profile</h3></div>
        <form className="modal-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <FormField label="Hospital name" name="hospitalName" defaultValue={hospital.hospitalName} full />
            <FormField label="Registration number" name="regNo" defaultValue={hospital.regNo} />
            <FormField label="Timezone" name="timezone" type="select" defaultValue={hospital.timezone} options={['Asia/Kolkata', 'Asia/Dubai', 'UTC']} />
            <FormField label="Currency" name="currency" type="select" defaultValue={hospital.currency} options={['INR (₹)', 'USD ($)', 'AED (د.إ)']} />
            <FormField label="Default language" name="language" type="select" defaultValue={hospital.language} options={['English', 'Hindi', 'Kannada']} />
          </div>
          <div className="modal-footer"><button className="primary-btn" type="submit">Save settings</button></div>
        </form>
      </article>
      <article className="card">
        <div className="card-head"><h3>Platform controls</h3></div>
        <div className="list-stack">
          {['Complete audit logging', 'Role-based access control', 'Leave & balance tracking'].map((item) => (
            <div className="item" key={item}><span>{item}</span><span className="pill good">Enabled</span></div>
          ))}
          <div className="item"><span>Two-factor authentication</span><span className="pill">Opt-in — configure from Profile</span></div>
          <div className="item"><span>Backups</span><span className="pill">On-demand — see Backup &amp; Restore</span></div>
        </div>
      </article>
    </div>
  );
}
