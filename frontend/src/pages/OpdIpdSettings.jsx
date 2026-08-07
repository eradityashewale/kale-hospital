import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import FormField from '../components/FormField.jsx';

export default function OpdIpdSettings() {
  const { settings, refresh } = useData();
  const showToast = useToast();
  const opd = settings.opd || {};
  const ipd = settings.ipd || {};

  const onSubmit = async (e, group, label) => {
    e.preventDefault();
    const data = new FormData(e.target);
    try {
      await apiFetch(`/settings/${group}`, { method: 'PUT', body: JSON.stringify({ values: Object.fromEntries(data.entries()) }) });
      showToast(`${label} saved successfully.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="grid-2">
      <article className="card">
        <div className="card-head"><h3>OPD settings</h3></div>
        <form className="modal-form" onSubmit={(e) => onSubmit(e, 'opd', 'OPD settings')}>
          <div className="form-grid">
            <FormField label="Default consultation fee (₹)" name="opdFee" type="number" defaultValue={opd.opdFee} />
            <FormField label="Token reset time" name="tokenReset" type="time" defaultValue={opd.tokenReset} />
            <FormField label="Max tokens per doctor / day" name="maxTokens" type="number" defaultValue={opd.maxTokens} />
          </div>
          <div className="modal-footer"><button className="primary-btn" type="submit">Save OPD settings</button></div>
        </form>
      </article>
      <article className="card">
        <div className="card-head"><h3>IPD settings</h3></div>
        <form className="modal-form" onSubmit={(e) => onSubmit(e, 'ipd', 'IPD settings')}>
          <div className="form-grid">
            <FormField label="General ward rate / day (₹)" name="generalRate" type="number" defaultValue={ipd.generalRate} />
            <FormField label="ICU rate / day (₹)" name="icuRate" type="number" defaultValue={ipd.icuRate} />
            <FormField label="Discharge approval required" name="dischargeApproval" type="select" defaultValue={ipd.dischargeApproval} options={['Yes', 'No']} />
          </div>
          <div className="modal-footer"><button className="primary-btn" type="submit">Save IPD settings</button></div>
        </form>
      </article>
    </div>
  );
}
