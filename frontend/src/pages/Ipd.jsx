import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { formatDate } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import AdmissionForm from '../components/forms/AdmissionForm.jsx';
import DischargeForm from '../components/forms/DischargeForm.jsx';

export default function Ipd() {
  const { user } = useAuth();
  const { ipdAdmissions } = useData();
  const { openModal } = useModal();
  const canAdmit = ['Super Admin', 'Admin', 'Doctor'].includes(user.role);

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Inpatient department</p>
          <h2>Admissions, ward assignment, and discharge in one place.</h2>
        </div>
        {canAdmit ? <button className="primary-btn" type="button" onClick={() => openModal('New IPD admission', (close) => <AdmissionForm close={close} />)}>New admission</button> : null}
      </div>
      <DataTable
        title="IPD admissions"
        rows={ipdAdmissions}
        rowKey="id"
        searchKeys={['patient', 'ward', 'doctor']}
        pageSize={8}
        columns={[
          { key: 'id', label: 'IPD No.' },
          { key: 'patient', label: 'Patient' },
          { key: 'ward', label: 'Ward' },
          { key: 'room', label: 'Room' },
          { key: 'bed', label: 'Bed' },
          { key: 'doctor', label: 'Doctor' },
          { key: 'admissionDate', label: 'Admitted', render: (r) => formatDate(r.admissionDate) },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={(row) => (row.status === 'Admitted' ? (
          <button className="subtle-btn" type="button" onClick={() => openModal('Discharge summary', (close) => <DischargeForm close={close} admission={row} />)}>Discharge</button>
        ) : null)}
      />
    </>
  );
}
