import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function MedicineForm({ close }) {
  const { refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      await apiFetch('/pharmacy', {
        method: 'POST',
        body: JSON.stringify({
          name: data.get('name'), category: data.get('category'), stock: Number(data.get('stock')) || 0,
          unit: data.get('unit') || 'units', expiry: data.get('expiry'), supplier: data.get('supplier'), price: Number(data.get('price')) || 0,
        }),
      });
      showToast(`${data.get('name')} added to inventory.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Medicine name" name="name" required />
        <FormField label="Category" name="category" type="select" options={['Tablet', 'Injectable', 'IV Fluid', 'Consumable', 'Syrup']} />
        <FormField label="Stock quantity" name="stock" type="number" required defaultValue="100" />
        <FormField label="Unit" name="unit" defaultValue="strips" />
        <FormField label="Expiry date" name="expiry" type="date" required />
        <FormField label="Supplier" name="supplier" required />
        <FormField label="Price (₹)" name="price" type="number" required defaultValue="50" />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Add to inventory</button>
      </div>
    </form>
  );
}
