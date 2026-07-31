import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { formatDate } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import LabTestForm from '../components/forms/LabTestForm.jsx';

export default function Laboratory() {
  const { user } = useAuth();
  const { labTests, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();
  const canBook = ['Super Admin', 'Admin', 'Doctor', 'Receptionist'].includes(user.role);

  const advance = async (id, status, message) => {
    try {
      await apiFetch(`/lab-tests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showToast(message, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Laboratory</p>
          <h2>Test bookings, sample tracking, and report review.</h2>
        </div>
        {canBook ? <button className="primary-btn" type="button" onClick={() => openModal('Book lab test', (close) => <LabTestForm close={close} />)}>Book lab test</button> : null}
      </div>
      <DataTable
        title="Lab test pipeline"
        rows={labTests}
        rowKey="id"
        searchKeys={['patient', 'test', 'doctor']}
        pageSize={8}
        columns={[
          { key: 'id', label: 'Test ID' },
          { key: 'patient', label: 'Patient' },
          { key: 'test', label: 'Test' },
          { key: 'doctor', label: 'Referred by' },
          { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={(row) => (
          <>
            {row.status === 'Booked' ? <button className="subtle-btn" type="button" onClick={() => advance(row.id, 'Sample Collected', 'Sample collected from patient.')}>Sample collected</button> : null}
            {row.status === 'Sample Collected' ? <button className="subtle-btn" type="button" onClick={() => advance(row.id, 'Completed', 'Lab report uploaded.')}>Upload report</button> : null}
            {row.status === 'Completed' ? <button className="subtle-btn" type="button" onClick={() => advance(row.id, 'Reviewed', 'Lab report reviewed by doctor.')}>Doctor review</button> : null}
          </>
        )}
      />
    </>
  );
}
