import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { apiFetch } from '../api.js';
import { formatDate } from '../utils.js';
import DataTable from '../components/DataTable.jsx';
import Pill from '../components/Pill.jsx';
import AppointmentForm from '../components/forms/AppointmentForm.jsx';

export default function Appointments() {
  const { user } = useAuth();
  const { appointments, refresh } = useData();
  const { openModal } = useModal();
  const showToast = useToast();
  const canBook = ['Super Admin', 'Admin', 'Receptionist'].includes(user.role);

  const updateStatus = async (id, status) => {
    try {
      const appt = await apiFetch(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      showToast(`Appointment ${appt.token} marked ${status}.`, 'success');
      await refresh();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="hero-card">
        <div>
          <p className="eyebrow">Appointment board</p>
          <h2>Book, confirm, and track patient appointments in real time.</h2>
        </div>
        {canBook ? <button className="primary-btn" type="button" onClick={() => openModal('Book appointment', (close) => <AppointmentForm close={close} />)}>Book appointment</button> : null}
      </div>
      <DataTable
        title="All appointments"
        rows={appointments}
        rowKey="id"
        searchKeys={['patient', 'doctor', 'department', 'token']}
        pageSize={8}
        columns={[
          { key: 'token', label: 'Token' },
          { key: 'patient', label: 'Patient' },
          { key: 'department', label: 'Department' },
          { key: 'doctor', label: 'Doctor' },
          { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
          { key: 'time', label: 'Time' },
          { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
        ]}
        actions={(row) => (
          <>
            {row.status !== 'Confirmed' ? <button className="subtle-btn" type="button" onClick={() => updateStatus(row.id, 'Confirmed')}>Confirm</button> : null}
            {row.status !== 'Cancelled' ? <button className="subtle-btn" type="button" onClick={() => updateStatus(row.id, 'Cancelled')}>Cancel</button> : null}
          </>
        )}
      />
    </>
  );
}
