import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm, formatCurrency } from '../../utils.js';
import FormField from '../FormField.jsx';

const CATEGORIES = ['Pantry', 'Equipment', 'Pharmacy Restock', 'Maintenance', 'Other'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpenseForm({ close }) {
  const { refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    const amount = Number(data.get('amount'));
    if (!(amount > 0)) { showToast('Amount must be greater than zero.', 'error'); return; }
    try {
      await apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category: data.get('category'), amount, date: data.get('date') || todayIso(),
          description: data.get('description') || '',
        }),
      });
      showToast(`Expense of ${formatCurrency(amount)} logged.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Category" name="category" type="select" required options={CATEGORIES} />
        <FormField label="Amount (₹)" name="amount" type="number" required />
        <FormField label="Date" name="date" type="date" defaultValue={todayIso()} required />
        <FormField label="Description" name="description" type="textarea" rows={3} full placeholder="e.g. Tea, coffee and snacks for the staff pantry" />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Log expense</button>
      </div>
    </form>
  );
}
