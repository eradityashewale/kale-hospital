import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import Pill from '../components/Pill.jsx';
import EmergencyForm from '../components/forms/EmergencyForm.jsx';

export default function Emergency() {
  const { user } = useAuth();
  const { emergencyCases } = useData();
  const { openModal } = useModal();
  const canRegister = ['Super Admin', 'Admin', 'Doctor', 'Nurse', 'Receptionist'].includes(user.role);

  return (
    <>
      <div className="hero-card" style={{ background: 'linear-gradient(135deg, rgba(208,59,59,0.92), rgba(236,131,90,0.85))' }}>
        <div>
          <p className="eyebrow">Emergency department</p>
          <h2>Live triage board for critical and serious cases.</h2>
        </div>
        {canRegister ? <button className="primary-btn" type="button" onClick={() => openModal('Register emergency case', (close) => <EmergencyForm close={close} />)}>Register emergency</button> : null}
      </div>
      <div className="grid-3">
        {emergencyCases.length ? emergencyCases.map((c) => (
          <article className="card" key={c.id}>
            <div className="card-head"><h3>{c.patient}</h3><Pill status={c.condition} /></div>
            <div className="list-stack">
              <div className="item"><span>Triage</span><span>{c.triage}</span></div>
              <div className="item"><span>Doctor</span><span>{c.doctor}</span></div>
              <div className="item"><span>Ambulance</span><span>{c.ambulance}</span></div>
              <div className="item"><span>Arrival</span><span>{c.arrival}</span></div>
            </div>
            <p className="field-hint">{c.notes}</p>
          </article>
        )) : <div className="empty-state">No active emergency cases.</div>}
      </div>
    </>
  );
}
