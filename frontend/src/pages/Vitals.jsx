import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import VitalsForm from '../components/forms/VitalsForm.jsx';

export default function Vitals() {
  const { patients } = useData();
  const { openModal } = useModal();
  const assigned = patients.filter((p) => p.status === 'IPD' || p.status === 'Critical');

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Nurse · Vitals & monitoring</p>
          <h2>Record vitals, medicine administration, and daily notes.</h2>
        </div>
      </div>
      <DataTable
        title="Patient monitoring"
        rows={assigned}
        rowKey="id"
        searchKeys={['name', 'ward', 'bed']}
        pageSize={8}
        columns={[
          { key: 'name', label: 'Patient' },
          { key: 'ward', label: 'Ward' },
          { key: 'bed', label: 'Bed' },
          { key: 'bp', label: 'BP', render: (r) => r.vitals?.bp || '120/80' },
          { key: 'temp', label: 'Temp (°F)', render: (r) => r.vitals?.temp || '98.6' },
          { key: 'spo2', label: 'SpO₂ (%)', render: (r) => r.vitals?.spo2 || '98' },
          { key: 'pulse', label: 'Pulse', render: (r) => r.vitals?.pulse || '78' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={(row) => <button className="subtle-btn" type="button" onClick={() => openModal(`Update vitals — ${row.name}`, (close) => <VitalsForm close={close} patient={row} />)}>Update vitals</button>}
      />
    </>
  );
}
