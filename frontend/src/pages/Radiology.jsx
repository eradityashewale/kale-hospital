import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { formatDate } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import RadiologyForm from '../components/forms/RadiologyForm.jsx';

export default function Radiology() {
  const { user } = useAuth();
  const { radiologyTests, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();
  const canBook = ['Super Admin', 'Admin', 'Doctor'].includes(user.role);

  const markReviewed = async (id) => {
    try {
      await apiFetch(`/radiology-tests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Reviewed' }) });
      showToast('Radiology report uploaded and marked reviewed.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Radiology</p>
          <h2>X-ray, MRI, CT, and ultrasound reporting workflow.</h2>
        </div>
        {canBook ? <button className="primary-btn" type="button" onClick={() => openModal('Book radiology scan', (close) => <RadiologyForm close={close} />)}>Book radiology scan</button> : null}
      </div>
      <DataTable
        title="Radiology pipeline"
        rows={radiologyTests}
        rowKey="id"
        searchKeys={['patient', 'type', 'doctor']}
        pageSize={8}
        columns={[
          { key: 'id', label: 'Scan ID' },
          { key: 'patient', label: 'Patient' },
          { key: 'type', label: 'Type' },
          { key: 'doctor', label: 'Referred by' },
          { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={(row) => (row.status === 'Pending'
          ? <button className="subtle-btn" type="button" onClick={() => markReviewed(row.id)}>Upload report</button>
          : <button className="subtle-btn" type="button" onClick={() => showToast('Radiology report opened for doctor review.', 'info')}>Doctor access</button>)}
      />
    </>
  );
}
