import { apiFetch } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

const LEAVE_TYPES = ['Sick', 'Casual', 'Paid', 'Unpaid'];

export default function LeaveForm({ close }) {
  const { user } = useAuth();
  const { refresh, leaveBalances } = useData();
  const showToast = useToast();

  const options = LEAVE_TYPES.map((lt) => {
    const bal = leaveBalances.find((b) => b.userId === user.id && b.leaveType === lt);
    return { value: lt, label: bal ? `${lt} (${bal.remaining} left)` : lt };
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    if (data.get('end_date') < data.get('start_date')) {
      showToast('End date cannot be before start date.', 'error');
      return;
    }
    try {
      await apiFetch('/leave', {
        method: 'POST',
        body: JSON.stringify({
          leave_type: data.get('leave_type'), start_date: data.get('start_date'),
          end_date: data.get('end_date'), reason: data.get('reason') || '',
        }),
      });
      showToast('Leave request submitted.', 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Leave type" name="leave_type" type="select" required options={options} />
        <FormField label="Start date" name="start_date" type="date" required />
        <FormField label="End date" name="end_date" type="date" required />
        <FormField label="Reason" name="reason" type="textarea" rows={3} full />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Submit request</button>
      </div>
    </form>
  );
}
