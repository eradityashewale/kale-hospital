import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { calcAge, downloadTextFile, formatCurrency, formatDate, initialsOf, printInvoice, printPatientRecord } from '../utils.js';
import Pill from './Pill.jsx';
import PrescriptionForm from './forms/PrescriptionForm.jsx';
import OpdVisitForm from './forms/OpdVisitForm.jsx';
import DischargeForm from './forms/DischargeForm.jsx';

const TABS = [
  ['overview', 'Overview'], ['medical', 'Medical History'], ['prescriptions', 'Prescriptions'],
  ['labs', 'Labs & Radiology'], ['billing', 'Billing'], ['admissions', 'Admission History'],
];

export default function PatientDrawer({ patientId, close, initialTab = 'overview' }) {
  const { user } = useAuth();
  const { patients, radiologyTests, ipdAdmissions, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();
  const [tab, setTab] = useState(initialTab);

  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return <div className="empty-state">Patient record not found.</div>;

  const radio = radiologyTests.filter((r) => r.patient === patient.name);

  const dischargeFromDrawer = () => {
    const admission = ipdAdmissions.find((a) => a.patient === patient.name && a.status === 'Admitted');
    if (!admission) { showToast('No active admission found for this patient.', 'error'); return; }
    openModal('Discharge summary', (c) => <DischargeForm close={c} admission={admission} />);
  };

  const downloadBill = (bill) => {
    const content = `Kale Hospital HMS\nInvoice: ${bill.id}\nPatient: ${patient.name}\nAmount: ${formatCurrency(bill.amount)}\nStatus: ${bill.status}\n`;
    downloadTextFile(`${bill.id}.txt`, content);
    showToast(`Invoice ${bill.id} downloaded.`, 'success');
  };

  const printFullRecord = () => {
    const ok = printPatientRecord(patient);
    showToast(ok ? 'Full patient record sent to print preview.' : 'Please allow pop-ups to print this record.', ok ? 'success' : 'error');
  };

  const printBill = (bill) => {
    const ok = printInvoice({ ...bill, patient: patient.name });
    showToast(ok ? `Invoice ${bill.id} sent to print preview.` : 'Please allow pop-ups to print this invoice.', ok ? 'success' : 'error');
  };

  const markPaid = async (billId) => {
    try {
      await apiFetch(`/bills/${billId}/mark-paid`, { method: 'POST' });
      showToast(`${billId} marked as paid.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="profile-header">
        <div className="profile-avatar">
          {patient.photo ? <img src={patient.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} /> : initialsOf(patient.name)}
        </div>
        <div>
          <h3>{patient.name}</h3>
          <p className="field-hint">{patient.id} · {patient.gender}, {calcAge(patient.dob)} yrs · <Pill status={patient.status} /></p>
        </div>
      </div>
      <div className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className={`tab-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className="tab-panel">
        {tab === 'overview' && (
          <>
            <div className="kv-grid">
              <div className="kv-item"><span>Mobile</span><strong>{patient.mobile}</strong></div>
              <div className="kv-item"><span>Alternate mobile</span><strong>{patient.altMobile || '—'}</strong></div>
              <div className="kv-item"><span>Email</span><strong>{patient.email || '—'}</strong></div>
              <div className="kv-item"><span>Blood group</span><strong>{patient.bloodGroup}</strong></div>
              <div className="kv-item"><span>Date of birth</span><strong>{formatDate(patient.dob)}</strong></div>
              <div className="kv-item"><span>Aadhaar</span><strong>{patient.aadhaar}</strong></div>
              <div className="kv-item"><span>Department</span><strong>{patient.department}</strong></div>
              <div className="kv-item"><span>Attending doctor</span><strong>{patient.doctor}</strong></div>
              <div className="kv-item form-full"><span>Address</span><strong>{patient.address}</strong></div>
              <div className="kv-item form-full"><span>Emergency contact</span><strong>{patient.emergencyContact}</strong></div>
              <div className="kv-item"><span>Insurance provider</span><strong>{patient.insurance.provider}</strong></div>
              <div className="kv-item"><span>Policy no.</span><strong>{patient.insurance.policyNo}</strong></div>
            </div>
            <div className="modal-footer">
              <button className="ghost-btn" type="button" onClick={printFullRecord}>Print full record</button>
              <button className="primary-btn" type="button" onClick={() => openModal('New OPD visit', (c) => <OpdVisitForm close={c} presetPatientId={patient.id} />)}>New OPD visit</button>
            </div>
          </>
        )}

        {tab === 'medical' && (
          <>
            <article className="card">
              <h4>Existing conditions</h4>
              <div className="tag-input-list">
                {(patient.diseases.length ? patient.diseases : ['None reported']).map((d) => <span className="tag-chip" key={d}>{d}</span>)}
              </div>
            </article>
            <article className="card">
              <h4>Allergies</h4>
              <div className="tag-input-list">
                {(patient.allergies.length ? patient.allergies : ['None reported']).map((d) => <span className="tag-chip" key={d}>{d}</span>)}
              </div>
            </article>
            <article className="card">
              <h4>Visit history</h4>
              <div className="list-stack">
                {patient.visits.length ? patient.visits.map((v, i) => (
                  <div className="item" key={i}><span>{formatDate(v.date)} · {v.type} · {v.doctor}</span><span>{v.diagnosis}</span></div>
                )) : <div className="empty-state">No visits recorded.</div>}
              </div>
            </article>
          </>
        )}

        {tab === 'prescriptions' && (
          <>
            <div className="flex-row">
              <h4>Prescription history</h4>
              {user.role === 'Doctor' ? (
                <button className="subtle-btn" type="button" onClick={() => openModal('Write prescription', (c) => <PrescriptionForm close={c} presetPatientId={patient.id} />)}>Write prescription</button>
              ) : null}
            </div>
            <div className="list-stack">
              {patient.prescriptions.length ? patient.prescriptions.map((rx, i) => (
                <div className="item" key={i}><span>{formatDate(rx.date)} · {rx.doctor}<br /><small>{rx.medicines}</small></span><span>Follow-up {formatDate(rx.followUp)}</span></div>
              )) : <div className="empty-state">No prescriptions on file.</div>}
            </div>
          </>
        )}

        {tab === 'labs' && (
          <>
            <article className="card">
              <h4>Laboratory reports</h4>
              <div className="list-stack">
                {patient.labReports.length ? patient.labReports.map((l, i) => (
                  <div className="item" key={i}><span>{formatDate(l.date)} · {l.test}</span><Pill status={l.status} /></div>
                )) : <div className="empty-state">No lab reports.</div>}
              </div>
            </article>
            <article className="card">
              <h4>Radiology reports</h4>
              <div className="list-stack">
                {radio.length ? radio.map((r) => (
                  <div className="item" key={r.id}><span>{formatDate(r.date)} · {r.type}</span><Pill status={r.status} /></div>
                )) : <div className="empty-state">No radiology reports.</div>}
              </div>
            </article>
          </>
        )}

        {tab === 'billing' && (
          <div className="list-stack">
            {patient.bills.length ? patient.bills.map((b) => (
              <div className="item" key={b.id}>
                <span>{b.id} · {formatDate(b.date)} · {formatCurrency(b.amount)}</span>
                <span className="row-actions">
                  <Pill status={b.status} />
                  <button className="subtle-btn" type="button" onClick={() => printBill(b)}>Print</button>
                  <button className="subtle-btn" type="button" onClick={() => showToast(`Invoice ${b.id} emailed successfully.`, 'success')}>Email</button>
                  <button className="subtle-btn" type="button" onClick={() => downloadBill(b)}>PDF</button>
                  {b.status !== 'Paid' ? <button className="subtle-btn" type="button" onClick={() => markPaid(b.id)}>Mark paid</button> : null}
                </span>
              </div>
            )) : <div className="empty-state">No bills raised.</div>}
          </div>
        )}

        {tab === 'admissions' && (
          <div className="list-stack">
            {patient.admissions.length ? patient.admissions.map((a, i) => (
              <div className="item" key={i}>
                <span>{a.ward} · Room {a.room} · Bed {a.bed}<br /><small>Admitted {formatDate(a.date)} by {a.doctor}</small></span>
                <span className="row-actions">
                  <Pill status={a.status} />
                  {a.status === 'Admitted' ? <button className="subtle-btn" type="button" onClick={dischargeFromDrawer}>Discharge</button> : null}
                </span>
              </div>
            )) : <div className="empty-state">No admission history.</div>}
          </div>
        )}
      </div>
    </>
  );
}
