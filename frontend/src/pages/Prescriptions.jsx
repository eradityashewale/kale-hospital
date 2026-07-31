import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { usePatientDrawer } from '../hooks/usePatientDrawer.jsx';
import { formatDate } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import PrescriptionForm from '../components/forms/PrescriptionForm.jsx';

export default function Prescriptions() {
  const { patients } = useData();
  const { openModal } = useModal();
  const openPatientDrawer = usePatientDrawer();

  const rows = [];
  patients.forEach((p) => p.prescriptions.forEach((rx, i) => rows.push({ ...rx, patient: p.name, patientId: p.id, rowId: `${p.id}-${i}` })));

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Doctor · Prescriptions</p>
          <h2>Write, review, and track prescriptions across your patients.</h2>
        </div>
        <button className="primary-btn" type="button" onClick={() => openModal('Write prescription', (close) => <PrescriptionForm close={close} />)}>Write prescription</button>
      </div>
      <DataTable
        title="Prescription log"
        rows={rows}
        rowKey="rowId"
        searchKeys={['patient', 'doctor', 'medicines']}
        pageSize={8}
        columns={[
          { key: 'patient', label: 'Patient', render: (r) => <span onClick={() => openPatientDrawer(r.patientId, 'prescriptions')} style={{ cursor: 'pointer' }}>{r.patient}</span> },
          { key: 'doctor', label: 'Doctor' },
          { key: 'medicines', label: 'Medicines' },
          { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
          { key: 'followUp', label: 'Follow-up', render: (r) => formatDate(r.followUp) },
        ]}
      />
    </>
  );
}
