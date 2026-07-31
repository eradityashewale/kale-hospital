import { apiFetch } from '../../api.js';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import FormField from '../FormField.jsx';

export default function VitalsForm({ close, patient }) {
  const { refresh } = useData();
  const showToast = useToast();
  const v = patient.vitals || {};

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    try {
      await apiFetch(`/patients/${patient.id}/vitals`, {
        method: 'PATCH',
        body: JSON.stringify({
          bp: data.get('bp'), temp: data.get('temp'), spo2: data.get('spo2'),
          sugar: data.get('sugar'), pulse: data.get('pulse'), weight: data.get('weight'), notes: data.get('notes') || '',
        }),
      });
      showToast(`Vitals updated for ${patient.name}.`, 'success');
      close();
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Blood pressure" name="bp" defaultValue={v.bp || '120/80'} placeholder="e.g. 120/80" />
        <FormField label="Temperature (°F)" name="temp" defaultValue={v.temp || '98.6'} />
        <FormField label="Oxygen saturation (%)" name="spo2" defaultValue={v.spo2 || '98'} />
        <FormField label="Blood sugar (mg/dL)" name="sugar" defaultValue={v.sugar || '110'} />
        <FormField label="Pulse (bpm)" name="pulse" defaultValue={v.pulse || '78'} />
        <FormField label="Weight (kg)" name="weight" defaultValue={v.weight || '68'} />
        <FormField label="Nursing notes" name="notes" type="textarea" rows={2} full />
      </div>
      <div className="modal-footer">
        <button className="ghost-btn" type="button" onClick={close}>Cancel</button>
        <button className="primary-btn" type="submit">Save vitals</button>
      </div>
    </form>
  );
}
