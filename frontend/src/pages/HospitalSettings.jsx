import { useToast } from '../context/ToastContext.jsx';
import FormField from '../components/FormField.jsx';

export default function HospitalSettings() {
  const showToast = useToast();
  const onSubmit = (e) => { e.preventDefault(); showToast('Settings saved successfully.', 'success'); };

  return (
    <div className="grid-2">
      <article className="card">
        <div className="card-head"><h3>Hospital profile</h3></div>
        <form className="modal-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <FormField label="Hospital name" name="hospitalName" defaultValue="Kale Hospital Multi-specialty Hospital" full />
            <FormField label="Registration number" name="regNo" defaultValue="KA-HMS-88213" />
            <FormField label="Timezone" name="timezone" type="select" options={['Asia/Kolkata', 'Asia/Dubai', 'UTC']} />
            <FormField label="Currency" name="currency" type="select" options={['INR (₹)', 'USD ($)', 'AED (د.إ)']} />
            <FormField label="Default language" name="language" type="select" options={['English', 'Hindi', 'Kannada']} />
          </div>
          <div className="modal-footer"><button className="primary-btn" type="submit">Save settings</button></div>
        </form>
      </article>
      <article className="card">
        <div className="card-head"><h3>Platform controls</h3></div>
        <div className="list-stack">
          {['Multi-branch support', 'Multi-language support', 'Complete audit logging', 'Automatic daily backups', 'PWA offline support', 'Two-factor authentication'].map((item) => (
            <div className="item" key={item}><span>{item}</span><span className="pill good">Enabled</span></div>
          ))}
        </div>
      </article>
    </div>
  );
}
