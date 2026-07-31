import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { usePatientDrawer } from '../hooks/usePatientDrawer.jsx';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';

export default function Patients() {
  const { user } = useAuth();
  const { patients } = useData();
  const navigate = useNavigate();
  const openPatientDrawer = usePatientDrawer();
  const canRegister = ['Super Admin', 'Admin', 'Receptionist'].includes(user.role);

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Patient operations</p>
          <h2>Track admissions, visits, and care history across the hospital.</h2>
        </div>
        {canRegister ? <button className="primary-btn" type="button" onClick={() => navigate('/registration')}>Register patient</button> : null}
      </div>
      <DataTable
        title="Patient directory"
        rows={patients}
        rowKey="id"
        searchKeys={['id', 'name', 'mobile', 'aadhaar', 'department']}
        searchPlaceholder="Search by ID, mobile, Aadhaar, or name"
        onRowClick={(id) => openPatientDrawer(id)}
        pageSize={8}
        columns={[
          { key: 'id', label: 'Patient ID' },
          { key: 'name', label: 'Name' },
          { key: 'department', label: 'Department' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
          { key: 'doctor', label: 'Doctor' },
        ]}
      />
    </>
  );
}
