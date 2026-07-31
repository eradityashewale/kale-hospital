import { useState } from 'react';
import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { validateForm, formatCurrency } from '../../utils.js';
import FormField from '../FormField.jsx';

function computeTotal(data) {
  const nums = ['consultation', 'room', 'operation', 'medicine', 'lab', 'radiology'].map((k) => Number(data.get(k)) || 0);
  const subtotal = nums.reduce((a, b) => a + b, 0);
  const discount = subtotal * ((Number(data.get('discount')) || 0) / 100);
  const gst = (subtotal - discount) * ((Number(data.get('gst')) || 0) / 100);
  return Math.round(subtotal - discount + gst);
}

export default function BillingForm({ close, presetPatientId }) {
  const { patients, refresh } = useData();
  const showToast = useToast();
  const [total, setTotal] = useState(0);

  const onInput = (e) => setTotal(computeTotal(new FormData(e.currentTarget)));

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) { showToast('Please select a patient.', 'error'); return; }
    const data = new FormData(form);
    try {
      const invoice = await apiFetch('/bills', {
        method: 'POST',
        body: JSON.stringify({
          patientId: data.get('patientId'), mode: data.get('mode'),
          consultation: Number(data.get('consultation')) || 0, room: Number(data.get('room')) || 0,
          operation: Number(data.get('operation')) || 0, medicine: Number(data.get('medicine')) || 0,
          lab: Number(data.get('lab')) || 0, radiology: Number(data.get('radiology')) || 0,
          discount: Number(data.get('discount')) || 0, gst: Number(data.get('gst')) || 0,
        }),
      });
      showToast(`Invoice ${invoice.id} generated for ${formatCurrency(invoice.amount)}.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit} onInput={onInput}>
      <div className="form-grid">
        <FormField label="Patient" name="patientId" type="select" required defaultValue={presetPatientId} options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` }))} />
        <FormField label="Payment mode" name="mode" type="select" options={['Cash', 'Card', 'Online', 'Insurance']} />
        <FormField label="Consultation charges (₹)" name="consultation" type="number" defaultValue="500" />
        <FormField label="Admission / room charges (₹)" name="room" type="number" defaultValue="0" />
        <FormField label="Operation charges (₹)" name="operation" type="number" defaultValue="0" />
        <FormField label="Medicine charges (₹)" name="medicine" type="number" defaultValue="0" />
        <FormField label="Lab charges (₹)" name="lab" type="number" defaultValue="0" />
        <FormField label="Radiology charges (₹)" name="radiology" type="number" defaultValue="0" />
        <FormField label="Discount (%)" name="discount" type="number" defaultValue="0" />
        <FormField label="GST (%)" name="gst" type="number" defaultValue="18" />
      </div>
      <p className="field-hint">Total: {formatCurrency(total)}</p>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Generate invoice</button>
      </div>
    </form>
  );
}
