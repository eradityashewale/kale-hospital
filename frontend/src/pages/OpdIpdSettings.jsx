import { useToast } from '../context/ToastContext.jsx';
import FormField from '../components/FormField.jsx';

export default function OpdIpdSettings() {
  const showToast = useToast();
  const onSubmit = (e, label) => { e.preventDefault(); showToast(`${label} saved successfully.`, 'success'); };

  return (
    <div className="grid-2">
      <article className="card">
        <div className="card-head"><h3>OPD settings</h3></div>
        <form className="modal-form" onSubmit={(e) => onSubmit(e, 'OPD settings')}>
          <div className="form-grid">
            <FormField label="Default consultation fee (₹)" name="opdFee" type="number" defaultValue="500" />
            <FormField label="Token reset time" name="tokenReset" type="time" defaultValue="06:00" />
            <FormField label="Max tokens per doctor / day" name="maxTokens" type="number" defaultValue="40" />
          </div>
          <div className="modal-footer"><button className="primary-btn" type="submit">Save OPD settings</button></div>
        </form>
      </article>
      <article className="card">
        <div className="card-head"><h3>IPD settings</h3></div>
        <form className="modal-form" onSubmit={(e) => onSubmit(e, 'IPD settings')}>
          <div className="form-grid">
            <FormField label="General ward rate / day (₹)" name="generalRate" type="number" defaultValue="1500" />
            <FormField label="ICU rate / day (₹)" name="icuRate" type="number" defaultValue="6000" />
            <FormField label="Discharge approval required" name="dischargeApproval" type="select" options={['Yes', 'No']} />
          </div>
          <div className="modal-footer"><button className="primary-btn" type="submit">Save IPD settings</button></div>
        </form>
      </article>
    </div>
  );
}
