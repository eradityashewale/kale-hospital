import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function VendorForm({ close }) {
  const { refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      await apiFetch('/vendors', {
        method: 'POST',
        body: JSON.stringify({
          name: data.get('name'), category: data.get('category'), contactPerson: data.get('contactPerson'),
          phone: data.get('phone'), email: data.get('email'), address: data.get('address'),
        }),
      });
      showToast(`${data.get('name')} added as a vendor.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Vendor name" name="name" required full />
        <FormField label="Category" name="category" type="select" options={['Pharmacy', 'Equipment', 'General']} />
        <FormField label="Contact person" name="contactPerson" />
        <FormField label="Phone" name="phone" required />
        <FormField label="Email" name="email" type="email" />
        <FormField label="Address" name="address" type="textarea" rows={2} full />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Add vendor</button>
      </div>
    </form>
  );
}
