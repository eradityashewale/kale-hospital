import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { formatCurrency, formatDate } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import OpdVisitForm from '../components/forms/OpdVisitForm.jsx';

export default function Opd() {
  const { user } = useAuth();
  const { opdVisits } = useData();
  const { openModal } = useModal();
  const canCreate = ['Super Admin', 'Admin', 'Doctor', 'Receptionist'].includes(user.role);

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Outpatient department</p>
          <h2>Every consultation, diagnosis, and prescription in one queue.</h2>
        </div>
        {canCreate ? <button className="primary-btn" type="button" onClick={() => openModal('New OPD visit', (close) => <OpdVisitForm close={close} />)}>New OPD visit</button> : null}
      </div>
      <DataTable
        title="OPD visits"
        rows={opdVisits}
        rowKey="id"
        searchKeys={['patient', 'doctor', 'department']}
        pageSize={8}
        columns={[
          { key: 'id', label: 'OPD No.' },
          { key: 'patient', label: 'Patient' },
          { key: 'department', label: 'Department' },
          { key: 'doctor', label: 'Doctor' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'fee', label: 'Fee', render: (r) => formatCurrency(r.fee) },
          { key: 'followUp', label: 'Follow-up', render: (r) => formatDate(r.followUp) },
        ]}
      />
    </>
  );
}
