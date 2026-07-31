import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm } from '../../utils.js';
import FormField from '../FormField.jsx';

export default function NotificationForm({ close }) {
  const { refresh } = useData();
  const showToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please complete the required fields.', 'error'); return; }
    const data = new FormData(form);
    try {
      await apiFetch('/notifications', {
        method: 'POST',
        body: JSON.stringify({ type: data.get('type'), message: data.get('message'), recipient: data.get('recipient') }),
      });
      showToast(`${data.get('type')} sent to ${data.get('recipient')}.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Channel" name="type" type="select" options={['SMS', 'Email', 'WhatsApp', 'Emergency Alert']} />
        <FormField label="Recipient" name="recipient" required placeholder="Patient, staff, or group" />
        <FormField label="Message" name="message" type="textarea" rows={3} full required />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Send</button>
      </div>
    </form>
  );
}
